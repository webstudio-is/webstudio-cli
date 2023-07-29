import ora from "ora";
import { sync } from "./sync";
import { prebuild } from "./prebuild";
import { PROJECT_PATH } from "./constants";
import { scaffoldProjectTemplate } from "./lib";
import { ProjectType } from "./types";

/*

Scaffolds a project by merging with the provided template

webstudio build <projectId> -> Loads a project and builds it for a clean new project

webstudio build -> Just builds the project, and performs a autho sync with the current status

*/

export const build = async (args: {
  positionals: Array<string>;
  values: { type: string };
}) => {
  const spinner = ora("Syncing Project");
  const projectId = args.positionals[1];
  const buildDir = projectId ? PROJECT_PATH : process.cwd();

  spinner.start();
  await sync(args);
  spinner.text = "Project synced successfully";

  spinner.text = "Scaffolding template";
  await scaffoldProjectTemplate(args.values.type as ProjectType, buildDir);

  spinner.text = "Running prebuild with the template";
  await prebuild(buildDir);

  spinner.text = "Installing dependencies...";
  const buildStatus = await $`cd ${buildDir} && npm install`;

  if (buildStatus.exitCode !== 0) {
    spinner.fail("Failed in building project \n");
  }

  spinner.succeed(`\nYou can find the build assets in \n ${buildDir}`);
};
