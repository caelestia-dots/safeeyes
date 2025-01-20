import { bind, GObject, register } from "astal";
import { App, astalify, Gtk, type ConstructProps } from "astal/gtk3";
import AppIndicator3 from "gi://AppIndicator3";
import SafeEyes from "./service";

@register()
class MenuItem extends astalify(Gtk.MenuItem) {
    constructor(props: ConstructProps<MenuItem, Gtk.MenuItem.ConstructorProps, { onActivate: [] }>) {
        super(props as any);
    }
}

@register({ GTypeName: "Indicator" })
export default class Indicator extends GObject.Object {
    readonly menu: Gtk.Menu;
    readonly indicator: AppIndicator3.Indicator;

    constructor() {
        super();

        this.menu = new Gtk.Menu();
        this.menu.append(
            new MenuItem({
                setup(self) {
                    self.label = `Next breaks at ${SafeEyes.next}`;
                    self.hook(SafeEyes, "notify::next", () => {
                        if (SafeEyes.next !== null) self.label = `Next breaks at ${SafeEyes.next}`;
                    });
                    self.hook(SafeEyes, "notify::disabled-until", () => {
                        if (SafeEyes.disabledUntil !== null) self.label = `Disabled until ${SafeEyes.disabledUntil}`;
                    });
                },
            })
        );
        this.menu.append(new Gtk.SeparatorMenuItem({ visible: true }));
        this.menu.append(
            new MenuItem({
                label: "Enable SafeEyes",
                onActivate: () => SafeEyes.start(),
                sensitive: bind(SafeEyes, "disabledUntil").as(d => d !== null),
            })
        );
        this.menu.append(
            new MenuItem({
                label: "Disable SafeEyes",
                sensitive: bind(SafeEyes, "disabledUntil").as(d => d === null),
                setup(self) {
                    const submenu = new Gtk.Menu();
                    submenu.append(new MenuItem({ label: "For 30 minutes", onActivate: () => SafeEyes.stop(30) }));
                    submenu.append(new MenuItem({ label: "For 1 hour", onActivate: () => SafeEyes.stop(60) }));
                    submenu.append(new MenuItem({ label: "For 2 hours", onActivate: () => SafeEyes.stop(120) }));
                    submenu.append(new MenuItem({ label: "For 3 hours", onActivate: () => SafeEyes.stop(180) }));
                    submenu.append(new MenuItem({ label: "Until restart", onActivate: () => SafeEyes.stop(-1) }));
                    self.set_submenu(submenu);
                },
            })
        );
        this.menu.append(
            new MenuItem({
                label: "Take a break now",
                setup(self) {
                    const submenu = new Gtk.Menu();
                    submenu.append(new MenuItem({ label: "Any break", onActivate: () => SafeEyes.any() }));
                    submenu.append(new MenuItem({ label: "Short break", onActivate: () => SafeEyes.short() }));
                    submenu.append(new MenuItem({ label: "Long break", onActivate: () => SafeEyes.long() }));
                    self.set_submenu(submenu);
                },
            })
        );
        this.menu.append(new MenuItem({ label: "Quit", onActivate: () => App.quit() }));

        this.indicator = AppIndicator3.Indicator.new(
            "caelestia-safeeyes",
            "view-reveal-symbolic",
            AppIndicator3.IndicatorCategory.APPLICATION_STATUS
        );
        this.indicator.set_status(AppIndicator3.IndicatorStatus.ACTIVE);
        this.indicator.set_menu(this.menu);
    }
}
