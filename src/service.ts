import { execAsync, Gio, GLib, GObject, property, register, signal, timeout, type Time } from "astal";
import { App } from "astal/gtk3";
import config from "../config";
import Inhibit from "./inhibit";

const shortPerLong = config.long.interval / config.short.interval;
const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const format = (n: GLib.DateTime, m: number) => n.add_minutes(m)?.format("%l:%M %P")?.trim() ?? null;

@register({ GTypeName: "SafeEyes" })
class SafeEyes extends GObject.Object {
    @signal()
    declare show: () => void;

    @signal()
    declare hide: () => void;

    @property(String)
    prompt: string = "Take a break";

    @property(String)
    type: "short" | "long" = "short";

    @property(String)
    time: number = 0;

    @property(String)
    next: string | null = null;

    @property(String)
    disabledUntil: string | null = "";

    #timeout: Time | null = null;
    #disableTimeout: Time | null = null;
    #count: number = 0;

    #updateNext() {
        const now = GLib.DateTime.new_now_local();
        const short = format(now, config.short.interval);
        const long = format(now, config.short.interval * (shortPerLong - (this.#count % shortPerLong)));
        this.next = short === long ? `${format(now, config.short.interval * 2)}/${long}` : `${short}/${long}`;
        this.notify("next");
    }

    #updateTime() {
        if (--this.time > 0) this.#timeout = timeout(1000, () => this.#updateTime());
        else if (this.disabledUntil === null) {
            this.#updateNext();
            this.#timeout = timeout(config.short.interval * 60 * 1000, () => this.#update());
            this.emit("hide");
            execAsync(`aplay ${SRC}/ding.wav`).catch(console.error);
        }
        this.notify("time");
    }

    #update() {
        // Skip if inhibited
        if (Inhibit.enabled) {
            this.#timeout = timeout(config.short.interval * 60 * 1000, () => this.#update());
            return;
        }

        const type = ++this.#count % shortPerLong === 0 ? "long" : "short";

        // App name will be gjs and no app icon but oh well
        const notification = new Gio.Notification();
        notification.set_title("Take a break");
        notification.set_body(`${type.slice(0, 1).toUpperCase() + type.slice(1)} break in ${config.prepTime} seconds`);
        notification.set_priority(Gio.NotificationPriority.LOW);

        // Notify
        App.send_notification("take-a-break", notification);

        this.#timeout = timeout(config.prepTime * 1000, () => {
            // Close notification
            App.withdraw_notification("take-a-break");

            this.prompt = random(config[type].prompts);
            this.notify("prompt");
            this.type = type;
            this.notify("type");
            this.emit("show");

            this.time = config[type].length;
            this.notify("time");

            this.#timeout = timeout(1000, () => this.#updateTime());
        });
    }

    any() {
        if (Math.random() < 0.5) this.short();
        else this.long();
    }

    short() {
        console.log("Short break");
        this.#count = 0;
        this.#update();
    }

    long() {
        console.log("Long break");
        this.#count = shortPerLong - 1;
        this.#update();
    }

    start() {
        if (this.disabledUntil === null) return;
        console.log("Enabled");

        this.#updateNext();
        this.#timeout = timeout(config.short.interval * 60 * 1000, () => this.#update());
        this.disabledUntil = null;
        this.notify("disabled-until");
        this.#disableTimeout?.cancel();
        this.#disableTimeout = null;
    }

    stop(length: number) {
        if (this.disabledUntil !== null) return;
        console.log(`Disabled for ${length} minutes`);

        this.#timeout?.cancel();
        this.#timeout = null;

        this.disabledUntil = length === -1 ? "restart" : format(GLib.DateTime.new_now_local(), length);
        this.notify("disabled-until");
        if (length !== -1) this.#disableTimeout = timeout(length * 60 * 1000, () => this.start());

        this.next = null;
        this.notify("next");
        this.emit("hide");
    }
}

export default new SafeEyes();
