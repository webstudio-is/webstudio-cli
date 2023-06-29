import sync from "./sync.js";
import { BUILD_DIR, checkSiteData, prepareDefaultRemixConfig } from "./lib.js";

export const build = async (args) => {
    const projectId = args.positionals[1];
    let exitCode = await checkSiteData(args);
    if (exitCode !== 0) {
        await sync(args);
        exitCode = await checkSiteData(args);
        if (exitCode !== 0) {
            throw new Error('Cannot build project')
        }
    }
    await prepareDefaultRemixConfig(args.values.type);
    console.log(`Building project...`)
    await $`pnpm tsx ./lib/prebuild.js ${projectId}`
    await $`cd ${BUILD_DIR} && pnpm install && pnpm run build`
    console.log(`Completed! You can find the build assets in "./${BUILD_DIR}" directory!`)
    console.log(`Or you can serve the build site with "webstudio serve" command!`)
}

export default build;   