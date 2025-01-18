import { bind } from "astal";
import { Astal, Gdk, Gtk } from "astal/gtk3";
import SafeEyes from "./service";

export default ({ monitor }: { monitor: Gdk.Monitor }) => (
    <window
        visible={false}
        gdkmonitor={monitor}
        namespace="safeeyes"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.EXCLUSIVE}
        layer={Astal.Layer.OVERLAY}
        setup={self => {
            self.hook(SafeEyes, "show", () => self.show());
            self.hook(SafeEyes, "hide", () => self.hide());
        }}
    >
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
            <label className="prompt" label={bind(SafeEyes, "prompt")} />
            <label className="time" label={bind(SafeEyes, "time").as(String)} />
            <button halign={Gtk.Align.CENTER} cursor="pointer" onClicked={() => SafeEyes.hide()} label="Close" />
        </box>
    </window>
);
