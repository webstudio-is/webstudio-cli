import 'zx/globals';
import { parseArgs } from "node:util";
import { VERSION, prepareConfigPath, showHelp, supportedBuildTypes } from "./lib.js";

import login from "./login.js";
import sync from "./sync.js";
import build from "./build.js";

const commands = {
    sync,
    login,
    build,
};

type Command = keyof typeof commands;

export const main = async () => {
    let args;
    try {
        args = parseArgs({
            options: {
                download: {
                    type: "boolean",
                },
                debug: {
                    type: "boolean",
                    short: "d",
                },
                version: {
                    type: "boolean",
                    short: "v",
                },
                help: {
                    type: "boolean",
                    short: "h",
                },
                type: {
                    type: "string",
                    short: "t",
                    default: "remix-app-server",
                }
            },
            allowPositionals: true,
        });
    } catch (e) {
        console.error(e);
        return showHelp();
    }

    if (args.values.debug) {
        $.verbose = true;
    } else {
        $.verbose = false;
    }

    await prepareConfigPath();

    if (args.values.help) {
        return showHelp()
    }
    if (args.values.version) {
        return console.log(VERSION);
    }
    if (args.positionals.length === 0) {
        return showHelp()
    }
    if (args.values.type && supportedBuildTypes.includes(args.values.type) === false) {
        console.error(`Invalid build type: ${args.values.type}`)
        console.log(`Supported build types: ${supportedBuildTypes.join(', ')}`)
        return
    }
    const command = args.positionals[0];
    if (command in commands === false) {
        return showHelp()
    }

    try {
        await commands[command as Command](args);
    } catch (e) {
        console.error(e);
        showHelp();
        return;
    }
};