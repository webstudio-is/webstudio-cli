import { getProjectDataPath } from "./constants.js";
import { checkAuth, fetchApi, prepareBuildDir } from "./lib.js";
import fs from "fs/promises";

export const sync = async (args: {
  positionals: Array<string>;
  values?: { type: string };
}) => {
  const projectId = args.positionals[1];
  if (projectId == null) {
    throw new Error("No projectId specified.");
  }

  await prepareBuildDir();

  const config = await checkAuth(projectId);
  if (!config) {
    throw new Error("Not logged in");
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
  await fs.writeFile(
    getProjectDataPath(projectId),
    JSON.stringify(projectData),
  );

  console.log(
    `\n Project data downloaded to ${getProjectDataPath(projectId)}.`,
  );
  console.log(`\n To build it, run \`webstudio build ${projectId}\``);
  return;
};
