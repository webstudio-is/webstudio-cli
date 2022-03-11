import inquirer from "inquirer";
import meow from "meow";
import "./fetch-polyfill.js";
import { sync } from "./sync.js";

const help = `
  Usage:
    $ wstd <command> [flags...]
  Commands:
    sync <projectId>      Fetch data over a Wesbstudio API
  Flags:
    --host,               Host e.g. http://localhost:3000
    --help, -h            Show this help message
    --version, -v         Show the version of this script
`;

const commands = {
  sync,
};

export const main = async () => {
  const { input, flags, showHelp, showVersion, pkg } = meow(help, {
    flags: {
      help: { type: "boolean", default: false, alias: "h" },
      version: { type: "boolean", default: false, alias: "v" },
    },
    importMeta: import.meta,
  });

  if (flags.help) showHelp();
  if (flags.version) showVersion();

  const [command, ...args] = input;

  if (command in commands === false) {
    showHelp();
  }

  await commands[command](...args, flags);
};
