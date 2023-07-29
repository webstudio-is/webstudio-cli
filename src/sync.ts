import type { Data } from "@webstudio-is/react-sdk";
import { loadProjectData } from "./lib";
import { join } from "path";
import { PROJECT_DATA_PATH, PORJECT_CONFIG_FILE } from "./constants";

/*

Loads the project-data and saves it into a local config file.

webstudio sync <projectId> -> Loads the data and creates a new webstudio project and saves it inside.

webstudio sync -> Loads the new project data and saves it to the webstudio.json in the existing folder.

*/
export const sync = async (args: {
  positionals: Array<string>;
  values?: { type: string };
}) => {
  const projectId = args.positionals[1];
  if (projectId == null) {
    try {
      const content = await fs.readFile(
        join(process.cwd(), "webstudio.json"),
        "utf8",
      );
      await loadProjectData(
        (JSON.parse(content) as Data).build.projectId,
        join(process.cwd(), PORJECT_CONFIG_FILE),
      );
      return;
    } catch {
      throw new Error(
        `Need to pass a projectId when then command is not being run inside a exising project`,
      );
    }
  }

  await loadProjectData(projectId, PROJECT_DATA_PATH);
};
