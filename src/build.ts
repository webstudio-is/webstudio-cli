import sync from "./sync.js";
import {
  BUILD_DIR,
  checkSiteData,
  detectPackageManager,
  pm,
  prepareDefaultRemixConfig,
} from "./lib.js";

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
  await prepareDefaultRemixConfig(args.values.type);
  console.log(`Building project...`);
  await $`${pm} run prebuild ${projectId}`;
  await $`cd ${BUILD_DIR} && ${pm} install && ${pm} run build`;
  console.log(
    `\nCompleted! You can find the build assets in "./${BUILD_DIR}" directory!`,
  );
};

