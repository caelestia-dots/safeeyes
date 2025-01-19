import { exec, execAsync, GObject, property, register, signal, timeout, type Time } from "astal";
import config from "../config";

const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

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

    #timeout: Time | null = null;
    #count: number = 0;

    #updateTime() {
        if (--this.time > 0) this.#timeout = timeout(1000, () => this.#updateTime());
        else {
            this.#timeout = timeout(config.short.interval * 60 * 1000, () => this.#update());
            this.emit("hide");
        }
        this.notify("time");
    }

    #update() {
        // Notify
        const id = exec(
            `notify-send -p -u low -i view-reveal-symbolic -a safeeyes 'Take a break' 'Break in ${config.prepTime} seconds'`
        );
        this.#timeout = timeout(config.prepTime * 1000, () => {
            // Close notification
            execAsync(
                `gdbus call --session --dest org.freedesktop.Notifications --object-path /org/freedesktop/Notifications --method org.freedesktop.Notifications.CloseNotification ${id}`
            ).catch(console.error);

            const type = ++this.#count % (config.long.interval / config.short.interval) === 0 ? "long" : "short";
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

    immediate() {
        if (this.#timeout === null) this.#update();
    }

    start() {
        if (this.#timeout === null) this.#timeout = timeout(config.short.interval * 60 * 1000, () => this.#update());
    }

    stop() {
        this.#timeout?.cancel();
        this.#timeout = null;
        this.emit("hide");
    }

    constructor() {
        super();

        this.start();
    }
}

export default new SafeEyes();
