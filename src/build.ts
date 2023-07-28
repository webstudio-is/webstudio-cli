import { sync } from "./sync.js";
import { checkSiteData, prepareDefaultRemixConfig } from "./lib.js";
import type { ProjectType } from "./types.js";
import { prebuild } from "./prebuild.js";
import ora from "ora";
import { BUILD_DIR } from "./constants.js";

export const build = async (args: {
  positionals: Array<string>;
  values: { type: string };
}) => {
  const spinner = ora();
  const projectId = args.positionals[1];

  let exitCode = await checkSiteData(args);

  if (exitCode !== 0) {
    spinner.start(`Syncing project.. \n`);
    await sync(args);
    spinner.text = "Checking for site data \n";

    exitCode = await checkSiteData(args);
    if (exitCode !== 0) {
      spinner.fail("Failed in syncing project \n");
      throw new Error("Cannot build project");
    }
    spinner.succeed("Synced project successfully \n");
  }

  const buildPorjectSpinner = ora("Scaffolding template \n");
  buildPorjectSpinner.start();

  await prepareDefaultRemixConfig(args.values.type as ProjectType);
  prebuild(projectId);

  buildPorjectSpinner.text = "Running Build \n";
  exitCode = await $`npm install ${BUILD_DIR}`.exitCode;
  if (exitCode !== 0) {
    spinner.fail("Failed in build project");
  }

  buildPorjectSpinner.succeed(
    `\nYou can find the build assets in \n ${BUILD_DIR}`,
  );
};
