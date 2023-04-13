import { loadProject } from "@webstudio-is/http-client";
import fs from "fs-extra";
import * as path from "path";

const dir = path.join(process.cwd(), ".webstudio");

const createIndex = async (files: Array<string>) => {
  const content = [];
  for (const fileName of files) {
    content.push(
      `export { default as ${fileName} } from "./${fileName}.json";`
    );
  }
  const filePath = path.join(dir, "index.ts");
  await fs.writeFile(filePath, content.join("\n"));
};

type Options = {
  host?: string;
};

export const sync = async (projectId: string, options: Options) => {
  if (typeof projectId !== "string") {
    throw new Error("Project ID is required");
  }
  if (typeof options.host !== "string") {
    throw new Error("Host is required");
  }

  const data = await loadProject({
    apiUrl: options.host,
    projectId,
  });

  fs.mkdirSync(dir);

  const writeToFilePromises = [];
  const files = [];

  for (const fileName in data) {
    files.push(fileName);
    const filePath = path.join(dir, `${fileName}.json`);
    writeToFilePromises.push(
      fs.outputJson(filePath, data[fileName], { spaces: 2 })
    );
  }

  await Promise.all([...writeToFilePromises, createIndex(files)]);

  console.log("Sync successful");
};
