import "zx/globals";
import fs from "fs/promises";
import { join } from "node:path";
import { deepmerge } from "deepmerge-ts";
import { ProjectType, type Auth, type Config, type Folder } from "./types";
import { link } from "./link";
import {
  GLOBAL_CONFIG_FILE,
  GLOBAL_CONFIG_PATH,
  HELP,
  MAX_RETRIES,
} from "./constants";
import { TEMPLATES } from "./templates";

let currentTries = 0;

export const showHelp = () => {
  console.log(HELP);
};

export const prepareGlobalConfigPath = async () => {
  await $`mkdir -p ${GLOBAL_CONFIG_PATH}`;
  await checkConfig();
};

export const scaffoldProjectTemplate = async (
  projectType: ProjectType,
  buildDir: string,
) => {
  console.log(`Preparing default configurations for ${projectType}...`);

  const defaultTemplate = TEMPLATES["defaults"];
  const projectTemplate = TEMPLATES[projectType];

  await parseFolderAndWriteFiles(defaultTemplate, buildDir);
  await parseFolderAndWriteFiles(projectTemplate, buildDir);

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
    join(buildDir, "package.json"),
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
    await ensureFileInPath(filePath);
    await fs.writeFile(filePath, file.content, "utf8");
  }

  for (let j = 0; j < folder.subFolders.length; j++) {
    const subFolder = folder.subFolders[j];
    await parseFolderAndWriteFiles(subFolder, join(path, subFolder.name));
  }
};

export const loadProjectData = async (projectId: string, path: string) => {
  const config = await checkAuthTokenForProject(projectId);
  if (!config) {
    throw new Error("Access token for the project is missing");
  }

  const { token, host } = config;
  const webstudioUrl = new URL(host);
  webstudioUrl.pathname = `/rest/buildId/${projectId}`;
  webstudioUrl.searchParams.append("authToken", token);

  console.log(`\n Checking latest build for project ${projectId}.`);
  const buildIdData = await fetchApi(webstudioUrl.href);
  const { buildId } = buildIdData;
  if (!buildId) {
    throw new Error("Project does not published yet");
  }

  webstudioUrl.pathname = `/rest/build/${buildId}`;
  console.log(`\n Downloading project data.`);

  const projectData = await fetchApi(webstudioUrl.href);

  await ensureFileInPath(path);
  await fs.writeFile(path, JSON.stringify(projectData));

  console.log(`\n Project data downloaded to ${path}.`);
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

export const checkAuthTokenForProject = async (
  projectId: string,
): Promise<Auth> => {
  if (currentTries >= MAX_RETRIES) {
    throw new Error("Too many tries, please login again.");
  }

  const config: Config = await getGlobalConfig();
  const found: Auth = config[projectId];
  if (found == null) {
    console.log(`Credentials not found for project ${projectId}\n`);
    await link();
    currentTries++;
    return await checkAuthTokenForProject(projectId);
  }
  return found;
};

export const getGlobalConfig = async () => {
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

export const ensureFileInPath = async (filePath: string) => {
  const dirname = path.dirname(filePath);

  try {
    await fs.access(dirname, fs.constants.F_OK);
  } catch (err) {
    await fs.mkdir(dirname, { recursive: true });
  }

  try {
    await fs.access(filePath, fs.constants.F_OK);
  } catch (err) {
    await fs.writeFile(filePath, "");
  }
};

export const deleteFolderIfExists = async (generatedDir: string) => {
  try {
    await fs.rmdir(generatedDir, { recursive: true });
    console.log("Folder deleted successfully (if it existed).");
  } catch (err) {
    if (err.code !== "ENOENT") {
      return;
    } else {
      console.error("Error while deleting the folder:", err);
    }
  }
};
