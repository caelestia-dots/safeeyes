import { execAsync, GLib, monitorFile, readFileAsync, writeFileAsync } from "astal";
import { App, type Gdk } from "astal/gtk3";
import SafeEyes from "./src/service";
import Window from "./src/window";

const CACHE = GLib.get_user_cache_dir() + "/caelestia";

const loadStyleAsync = async () => {
    let scheme = "mocha";
    if (GLib.file_test(`${CACHE}/scheme/current.txt`, GLib.FileTest.EXISTS)) {
        const currentScheme = await readFileAsync(`${CACHE}/scheme/current.txt`);
        if (GLib.file_test(`${SRC}/scheme/_${currentScheme}.scss`, GLib.FileTest.EXISTS)) scheme = currentScheme;
    }
    await writeFileAsync(`${SRC}/scheme/_index.scss`, `@forward "${scheme}";`);
    App.apply_css(await execAsync(`sass ${SRC}/style.scss`), true);
};

App.start({
    instanceName: "safeeyes",
    main() {
        const now = Date.now();
        loadStyleAsync().catch(console.error);
        monitorFile(`${CACHE}/scheme/current.txt`, () => loadStyleAsync().catch(console.error));

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
        else return res("Unknown command: " + request);

        console.log(`Request handled: ${request}`);
        res("OK");
    },
});
