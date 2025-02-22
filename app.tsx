import { execAsync, GLib, monitorFile, readFileAsync, writeFileAsync } from "astal";
import { App, type Gdk } from "astal/gtk3";
import config from "./config";
import Indicator from "./src/indicator";
import Inhibit from "./src/inhibit";
import SafeEyes from "./src/service";
import Window from "./src/window";

const C_STATE = GLib.get_user_state_dir() + "/caelestia";

const loadStyleAsync = async () => {
    let schemeColours;
    if (GLib.file_test(`${C_STATE}/scheme/current.txt`, GLib.FileTest.EXISTS)) {
        const currentScheme = await readFileAsync(`${C_STATE}/scheme/current.txt`);
        schemeColours = currentScheme
            .split("\n")
            .map(l => {
                const [name, hex] = l.split(" ");
                return `$${name}: #${hex};`;
            })
            .join("\n");
    } else schemeColours = await readFileAsync(`${SRC}/scheme/_default.scss`);
    await writeFileAsync(`${SRC}/scheme/_index.scss`, schemeColours);
    App.apply_css(await execAsync(`sass ${SRC}/style.scss`), true);
};

App.start({
    instanceName: "safeeyes",
    main() {
        const now = Date.now();
        loadStyleAsync().catch(console.error);
        monitorFile(`${C_STATE}/scheme/current.txt`, () => loadStyleAsync().catch(console.error));

        SafeEyes.start();
        if (config.fullscreenInhibit) Inhibit.start();
        Object.assign(App, { indicator: new Indicator() }); // Assign it as a property of the app to prevent it from being garbage collected

        const map = new Map<Gdk.Monitor, JSX.Element>();
        App.get_monitors().forEach(m => map.get(m) ?? map.set(m, <Window monitor={m} />));
        App.connect("monitor-added", (_, m) => map.get(m) ?? map.set(m, <Window monitor={m} />));
        App.connect("monitor-removed", (_, m) => map.get(m)?.destroy());

        console.log(`SafeEyes started in ${Date.now() - now}ms`);
    },
    requestHandler(request, res) {
        if (request === "quit") App.quit();
        else if (request === "reload-css") loadStyleAsync().catch(console.error);
        else if (request === "hide") SafeEyes.hide();
        else if (request === "any") SafeEyes.any();
        else if (request === "short") SafeEyes.short();
        else if (request === "long") SafeEyes.long();
        else if (request === "enable") SafeEyes.start();
        else if (request.startsWith("disable")) SafeEyes.stop(parseInt(request.slice(7), 10));
        else return res("Unknown command: " + request);

        console.log(`Request handled: ${request}`);
        res("OK");
    },
});
