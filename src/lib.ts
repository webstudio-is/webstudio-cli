import "zx/globals";
import fs from "fs/promises";
import { join } from "node:path";
import { deepmerge } from "deepmerge-ts";
import { ProjectType, type Auth, type Config, type Folder } from "./types.js";
import { login } from "./login.js";
import {
  GLOBAL_CONFIG_FILE,
  GLOBAL_CONFIG_PATH,
  HELP,
  MAX_RETRIES,
  BUILD_DIR,
  getProjectDataPath,
} from "./constants.js";
import { TEMPLATES } from "./templates.js";

let currentTries = 0;

export const showHelp = () => {
  console.log(HELP);
};

export const prepareConfigPath = async () => {
  await $`mkdir -p ${GLOBAL_CONFIG_PATH}`;
  await checkConfig();
};

export const prepareBuildDir = async () => {
  await $`rm -rf ${BUILD_DIR}`;
  await $`mkdir -p ${BUILD_DIR}/app/__generated__`;
  await $`mkdir -p ${BUILD_DIR}/app/routes`;
};

export const checkSiteData = async (args: {
  positionals: Array<string>;
  values?: { type: string };
}) => {
  const projectId = args.positionals[1];
  return await $`ls -1 ${getProjectDataPath(projectId)} > /dev/null 2>&1`
    .exitCode;
};

export const prepareDefaultRemixConfig = async (projectType: ProjectType) => {
  console.log(`Preparing default configurations for ${projectType}...`);

  const defaultTemplate = TEMPLATES["defaults"];
  const projectTemplate = TEMPLATES[projectType];

  await parseFolderAndWriteFiles(defaultTemplate, BUILD_DIR);
  await parseFolderAndWriteFiles(projectTemplate, BUILD_DIR);

  const defaultPackageJSON = JSON.parse(
    defaultTemplate.files.find((file) => file.name === "package.json")
      ?.content || "{}",
  );
  const projectPackageJSON = JSON.parse(
    projectTemplate.files.find((file) => file.name === "package.json")
      ?.content || "{}",
  );
  const packageJSON = deepmerge(defaultPackageJSON, projectPackageJSON);
  await fs.writeFile(
    join(BUILD_DIR, "package.json"),
    JSON.stringify(packageJSON, null, 2),
    "utf8",
  );
};

const parseFolderAndWriteFiles = async (folder: Folder, path: string) => {
  for (let i = 0; i < folder.files.length; i++) {
    const file = folder.files[i];
    if (file.name === "package.json") {
      continue;
    }

    const filePath = join(path, file.name);
    await fs.writeFile(filePath, file.content, "utf8");
  }

  for (let j = 0; j < folder.subFolders.length; j++) {
    const subFolder = folder.subFolders[j];
    await parseFolderAndWriteFiles(subFolder, join(path, subFolder.name));
  }
};

export const checkConfig = async () => {
  try {
    console.log("checking access");
    await fs.access(GLOBAL_CONFIG_FILE);
  } catch (error) {
    console.log(JSON.stringify({}));
    fs.writeFile(GLOBAL_CONFIG_FILE, JSON.stringify({}));
  }
};

export const checkAuth = async (projectId: string): Promise<Auth> => {
  if (currentTries >= MAX_RETRIES) {
    throw new Error("Too many tries, please login again.");
  }
  const config: Config = await getConfig();
  const found: Auth = config[projectId];
  if (found == null) {
    console.log(`Credentials not found for project ${projectId}\n`);
    await login();
    currentTries++;
    return await checkAuth(projectId);
  }
  return found;
};

export const getConfig = async () => {
  const config = await fs.readFile(GLOBAL_CONFIG_FILE, "utf-8");
  try {
    const json = JSON.parse(config);
    return json;
  } catch (error) {
    return null;
  }
};

export const fetchApi = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok) {
    if (
      response.status === 400 ||
      response.status === 401 ||
      response.status === 500
    ) {
      if (data) {
        console.error(data);
        throw new Error(data);
      } else {
        console.error("Internal server error");
        throw new Error("Internal server error");
      }
    }
  }
  return data;
};
