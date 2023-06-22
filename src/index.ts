import 'zx/globals';
import { parseArgs } from "node:util";
import { BUILD_DIR, checkAuth, prepareBuildDir, prepareConfigPath, prepareDefaultRemixConfig } from "./lib.js";
import login from "./login.js";
import download from "./download.js";
// import { prebuild } from "./prebuild.js";
// import prebuild from "./prebuild.js";

export const main = async () => {
    await prepareConfigPath();
    const args = parseArgs({
        options: {
            login: {
                type: "boolean",
                short: "l",
            },
            url: {
                type: "string",
                short: "u",
                default: "https://apps.webstudio.is",
            },
            download: {
                type: "boolean",
                short: "d",
            },
            build: {
                type: "boolean",
                short: "b",
            },
            serve: {
                type: "boolean",
                short: "s",
            }
        },
        allowPositionals: true,
    });
    if (args.values.login) {
        return await login(args.values.url);
    }
    if (args.values.download) {
        if (args.positionals.length === 0) {
            console.error('Please provide a build id to download');
            return;
        }
        const buildId = args.positionals[0];
        await checkAuth(args.values.url);
        await download(buildId);
    }
    if (args.values.build) {
        await prepareBuildDir();
        await prepareDefaultRemixConfig();
        await $`pnpm tsx src/prebuild.ts`
        await $`cd ${BUILD_DIR} && pnpm install && pnpm run build`
    }
    if (args.values.serve) {
        await $`cd ${BUILD_DIR} && pnpm run start`
    }
};