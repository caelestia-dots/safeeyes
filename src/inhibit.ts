import { GObject, property, register } from "astal";
import AstalHyprland from "gi://AstalHyprland";

@register({ GTypeName: "Inhibit" })
class Inhibit extends GObject.Object {
    @property(Boolean)
    enabled: boolean = false;

    start() {
        const hyprland = AstalHyprland.get_default();
        if (hyprland) {
            let id: number | null = null;
            let lastClient: AstalHyprland.Client | null = null;

            const updateInhibit = () => {
                const old = this.enabled;
                this.enabled = lastClient?.get_fullscreen() === AstalHyprland.Fullscreen.FULLSCREEN;
                if (old !== this.enabled) {
                    this.notify("enabled");
                    console.log(this.enabled ? "Inhibited" : "Not inhibited");
                }
            };

            const connectClient = () => {
                if (id !== null) {
                    lastClient?.disconnect(id);
                    id = null;
                }
                lastClient = hyprland.get_focused_client();
                if (lastClient) {
                    id = lastClient.connect("notify::fullscreen", updateInhibit);
                    updateInhibit();
                }
            };

            hyprland.connect("notify::focused-client", connectClient);
            connectClient();
        }
    }
}

export default new Inhibit();
