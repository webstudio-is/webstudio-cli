import { readdirSync, lstatSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Folder } from "../src/types";

const TEMPLATES_TO_BUILD = ["vercel", "defaults"];

console.log("Building Templates...");

const parseFolder = (folderPath: string): Folder | undefined => {
  const isDirectory = lstatSync(folderPath).isDirectory();
  if (isDirectory === false) {
    return;
  }

  const folderName = folderPath.split("/").pop();
  if (folderName === undefined) {
    return;
  }

  const folder: Folder = {
    name: folderName,
    files: [],
    subFolders: [],
  };

  const files = readdirSync(folderPath);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = join(folderPath, file);
    const statSync = lstatSync(filePath);
    const isDirectory = statSync.isDirectory();
    const isFile = statSync.isFile();

    if (isDirectory) {
      const subFolder = parseFolder(filePath);
      if (subFolder !== undefined) {
        folder.subFolders.push(subFolder);
      }
    }

    if (isFile) {
      const content = readFileSync(filePath, "utf-8");
      folder.files.push({
        name: file,
        content,
        encoding: "utf-8",
      });
    }
  }

  return folder;
};

const TEMPLATES_JSON: Record<string, Folder> = {};
const TEMPLATES_JSON_PATH = new URL("../src/templates.ts", import.meta.url)
  .pathname;

for (let i = 0; i < TEMPLATES_TO_BUILD.length; i++) {
  const template = TEMPLATES_TO_BUILD[i];
  const templatePath = new URL(`./${template}`, import.meta.url).pathname;
  const templateFiles = parseFolder(templatePath);
  if (templateFiles === undefined) {
    throw new Error(`Template ${template} not found`);
  }
  TEMPLATES_JSON[template] = templateFiles;
}

const content = `import type { Folder, ProjectType } from "./types" \n
export const TEMPLATES: Record<ProjectType, Folder> = ${JSON.stringify(
  TEMPLATES_JSON,
  null,
  2,
)}`;

writeFileSync(TEMPLATES_JSON_PATH, content, "utf-8");
