import packageJson from "../package.json" assert { type: "json" };
import xdgAppPaths from "xdg-app-paths";
import { join } from "node:path";
import { ProjectType } from "./types.js";

export const VERSION = packageJson.version;
export const MAX_RETRIES = 3;
/*
  TODO: Let's see if we can change this with the project name
*/
export const BUILD_DIR = join(process.cwd(), "webstudio-project");
export const GLOBAL_CONFIG_PATH = xdgAppPaths("webstudio").config();
export const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_PATH, "config.json");

export const getProjectDataPath = (projectId: string) =>
  join(BUILD_DIR, `webstudio-${projectId}.json`);

export const HELP = `Usage:
    $ webstudio commands [flags...]
  Commands:
    login <shared link>             Login to Webstudio with shared link
    sync <projectId>                Download a project's site data
    build [projectId]               Build a site
  Flags:
    --type, -t                      Build type chosen during build command (default: remix-app-server)
                                    (options: ${Object.values(ProjectType).join(
                                      ", ",
                                    )})
    --debug                         Enable debug mode
    --help, -h                      Show this help message
    --version, -v                   Show the version of this script
`;
