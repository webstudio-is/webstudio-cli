import 'zx/globals';
import { parseArgs } from "node:util";
import { BUILD_DIR, supportedBuildTypes, prepareBuildDir, prepareConfigPath, prepareDefaultRemixConfig, HELP, VERSION } from "./lib.js";

import login from "./login.js";
import download from "./download.js";

export const main = async () => {
    const args = parseArgs({
        options: {
            debug: {
                type: "boolean",
            },
            version: {
                type: "boolean",
                short: "v",
            },
            help: {
                type: "boolean",
                short: "h",
            },
            login: {
                type: "boolean",
                short: "l",
            },
            download: {
                type: "boolean",
                short: "d",
            },
            build: {
                type: "boolean",
                short: "b",
            },
            type: {
                type: "string",
                short: "t",
                default: "remix-app-server",
            },
            serve: {
                type: "boolean",
                short: "s",
            }
        },
        allowPositionals: true,
    });
    if (args.values.debug) {
        $.verbose = true;
    } else {
        $.verbose = false;
    }
    if (args.values.help) {
        return console.log(HELP);
    }
    if (args.values.version) {
        return console.log(VERSION);
    }
    await prepareConfigPath();
    if (args.values.type) {
        if (!supportedBuildTypes.includes(args.values.type)) {
            console.error(`Unsupported build type: ${args.values.type}`);
            console.log(`Supported build types: ${supportedBuildTypes.join(', ')}`);
            console.log(`Defaulting to remix-app-server`)
            return;
        }
    }

    if (args.values.login) {
        return await login();
    }
    await prepareBuildDir();
    if (args.values.download) {
        if (args.positionals.length === 0) {
            console.error('Please provide a project Id to download');
            return;
        }
        const projectId = args.positionals[0];
        await download(projectId);
    }
    if (args.values.build) {
        // @ts-ignore
        await prepareDefaultRemixConfig(args.values.type);
        await $`pnpm tsx src/prebuild.ts`
        await $`cd ${BUILD_DIR} && pnpm install && pnpm run build`
    }
    if (args.values.serve) {
        if (args.values.type === 'vercel') {
            console.error('Vercel builds cannot be served locally');
        } else {
            await $`cd ${BUILD_DIR} && pnpm run start`
        }
    }
    if (!args.values.download && !args.values.build && !args.values.login && !args.values.serve) {
        console.log(HELP);
    }
};