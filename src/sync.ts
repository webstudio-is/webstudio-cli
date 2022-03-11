import fs from "fs-extra";
import * as path from "path";

const dir = path.join(process.cwd(), ".webstudio");

export const sync = async (projectId, options) => {
  if (typeof projectId !== "string") {
    throw new Error("Project ID is required");
  }
  if (typeof options.host !== "string") {
    throw new Error("Host is required");
  }

  const url = `${options.host}/rest/tree/${projectId}`;
  const response = await fetch(url);
  const json = await response.json();
  const filePath = path.join(dir, "tree.json");
  await fs.outputJson(filePath, json, { spaces: 2 });
};
