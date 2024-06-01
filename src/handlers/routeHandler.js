import { readdirSync, lstatSync } from "fs";
import { join } from "path";

const loadRoutes = (app, dir) => {
  const files = readdirSync(join(__dirname, dir));
  for (const file of files) {
    const stat = lstatSync(join(__dirname, dir, file));
    if (stat.isDirectory()) {
      loadRoutes(app, join(dir, file));
    } else {
      if (file.endsWith(".js")) {
        let routePath = `${dir}/${file}`
          .replace("routes", "")
          .replace(".js", "")
          .replace(/\\/g, "/")
          .replace("../", "");

        if (file === "main.js") {
          routePath = routePath.replace("main", "");
        }

        const routeLogic = require(join(__dirname, dir, file));
        app.use(routePath, routeLogic);
        console.log(`> Loaded route: ${routePath}`);
      }
    }
  }
};

export default loadRoutes;
