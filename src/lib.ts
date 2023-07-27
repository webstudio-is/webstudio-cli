import "zx/globals";
import fs from "fs/promises";
import { ProjectType, type Auth, type Config, type Folder } from "./types.js";
import { deepmerge } from "deepmerge-ts";
import { login } from "./login.js";
import {
  CONFIG_FILE,
  CONFIG_PATH,
  HELP,
  MAX_RETRIES,
  BUILD_DIR,
} from "./constants.js";
import { TEMPLATES } from "./templates.js";
import { writeFileSync } from "fs";

let currentTries = 0;

export const showHelp = () => {
  console.log(HELP);
};

export const prepareConfigPath = async () => {
  await $`mkdir -p ${CONFIG_PATH}`;
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
  return await $`ls -1 ${BUILD_DIR}/${projectId}.json > /dev/null 2>&1`
    .exitCode;
};

const getFileContent = (filePath: string, projectType: ProjectType): string => {
  const parts = filePath.split("/").filter((part) => part !== "");
  const folder = TEMPLATES[projectType];

  const findFileInFolder = (
    searchFolder: Folder,
    remainingParts: string[],
  ): string => {
    const fileName = remainingParts[0];

    if (remainingParts.length === 1) {
      const file = searchFolder.files.find((f) => f.name === fileName);
      if (file) {
        return file.content;
      }

      throw new Error(`Failed to find the file ${filePath} from the template`);
    } else {
      const nextFolderName = remainingParts[1];
      const nextSubFolder = searchFolder.subFolders.find(
        (subFolder) => subFolder.name === nextFolderName,
      );

      if (nextSubFolder) {
        return findFileInFolder(nextSubFolder, remainingParts.slice(1));
      } else {
        throw new Error(
          `Failed to find the file ${filePath} from the template`,
        );
      }
    }
  };

  return findFileInFolder(folder, parts);
};

export const prepareDefaultRemixConfig = async (type: ProjectType) => {
  console.log(`Preparing default configurations for ${type}...`);

  const defaultPackageJSON = JSON.parse(
    getFileContent("/package.json", ProjectType.defaults),
  );
  const projectTypePackageJSON = JSON.parse(
    getFileContent("/package.json", type),
  );

  const mergedPackageJSON = deepmerge(
    defaultPackageJSON,
    projectTypePackageJSON,
  );

  /* Merging the default package.json with the template specific package.json */
  writeFileSync(
    `${BUILD_DIR}/package.json`,
    JSON.stringify(mergedPackageJSON, null, 2),
  );

  writeFileSync(
    `${BUILD_DIR}/template.tsx`,
    getFileContent("/template.tsx", ProjectType.defaults),
  );

  writeFileSync(
    `${BUILD_DIR}/app/root.tsx`,
    getFileContent("/root.tsx", ProjectType.defaults),
  );

  switch (type) {
    case ProjectType.vercel: {
      writeFileSync(
        `${BUILD_DIR}/remix.config.js`,
        getFileContent("/remix.config.js", ProjectType.vercel),
      );

      writeFileSync(
        `${BUILD_DIR}/server.ts`,
        getFileContent("/server.ts", ProjectType.vercel),
      );

      break;
    }
    default:
      throw new Error(`Unknown project type ${type}`);
  }
};

export const checkConfig = async () => {
  try {
    console.log("checking access");
    await fs.access(CONFIG_FILE);
  } catch (error) {
    console.log(JSON.stringify({}));
    fs.writeFile(CONFIG_FILE, JSON.stringify({}));
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
  const config = await fs.readFile(CONFIG_FILE, "utf-8");
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
