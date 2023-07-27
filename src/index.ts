import "zx/globals";
import { parseArgs } from "node:util";
import { prepareConfigPath, showHelp } from "./lib.js";
import { VERSION } from "./constants.js";
import { ProjectType } from "./types.js";

// import { login } from "./login.js";
// import { sync } from "./sync.js";
import { build } from "./build.js";

const commands = {
  // sync,
  // login,
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
          default: "vercel",
        },
      },
      allowPositionals: true,
    });
  } catch (error) {
    console.error(error);
    return showHelp();
  }

  if (args.values.debug) {
    $.verbose = true;
  } else {
    $.verbose = false;
  }

  await prepareConfigPath();

  if (args.values.help || args.positionals.length === 0) {
    if (
      args.values.type &&
      Object.values(ProjectType).includes(args.values.type as ProjectType) ===
        false
    ) {
      console.error(`Invalid build type: ${args.values.type}`);
      console.log(
        `Supported build types: ${Object.values(ProjectType).join(", ")}\n`,
      );
    }
    return showHelp();
  }
  if (args.values.version) {
    return console.log(VERSION);
  }
  const command = args.positionals[0];
  if (command in commands === false) {
    return showHelp();
  }

  try {
    await commands[command as Command](args);
  } catch (error) {
    console.error(error);
    showHelp();
    return;
  }
};
