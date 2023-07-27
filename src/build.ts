import { sync } from "./sync.js";
import {
  checkSiteData,
  detectPackageManager,
  pm,
  prepareDefaultRemixConfig,
} from "./lib.js";
import type { ProjectType } from "./types.js";
// import { BUILD_DIR } from "./constants.js";

export const build = async (args: {
  positionals: Array<string>;
  values: { type: string };
}) => {
  await detectPackageManager();
  const projectId = args.positionals[1];
  let exitCode = await checkSiteData(args);
  if (exitCode !== 0) {
    await sync(args);
    exitCode = await checkSiteData(args);
    if (exitCode !== 0) {
      throw new Error("Cannot build project");
    }
  }

  await prepareDefaultRemixConfig(args.values.type as ProjectType);
  console.log(`Building project...`);
  await $`${pm} run prebuild ${projectId}`;
  // await $`cd ${BUILD_DIR} && ${pm} install && ${pm} run build`;
  // console.log(
  //   `\nCompleted! You can find the build assets in "./${BUILD_DIR}" directory!`,
  // );
};
