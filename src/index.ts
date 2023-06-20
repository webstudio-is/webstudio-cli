import { parseArgs } from "node:util";
import { checkAuth, checkConfig, prepare } from "./lib.js";
import login from "./login.js";
import download from "./download.js";

export const main = async () => {
    await prepare();
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
        return await download(buildId);
    }
};