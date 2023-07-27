import * as readline from "node:readline/promises";
import fs from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { CONFIG_FILE } from "./constants.js";

export const login = async () => {
  const rl = readline.createInterface({ input, output });
  const shareLink = await rl.question(`Paste share link (with build access): `);
  try {
    const shareLinkUrl = new URL(shareLink);
    const host = shareLinkUrl.origin;
    const token = shareLinkUrl.searchParams.get("authToken");
    const paths = shareLinkUrl.pathname.split("/").filter(Boolean);
    if (paths[0] !== "builder" || paths.length !== 2) {
      throw new Error("Invalid share link.");
    }
    const projectId = paths[1];
    if (!token || !projectId || !host) {
      throw new Error("Invalid share link.");
    }

    const currentConfig = await fs.readFile(CONFIG_FILE, "utf-8");
    const currentConfigJson = JSON.parse(currentConfig);
    const newConfig = {
      ...currentConfigJson,
      [projectId]: {
        host,
        token,
      },
    };
    console.log(CONFIG_FILE);
    await fs.writeFile(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    rl.close();
    console.log(`Saved credentials for project ${projectId}.`);
    return;
  } catch (error) {
    console.error(error);
    console.error("Invalid share link.");
    process.exit(1);
  }
};
