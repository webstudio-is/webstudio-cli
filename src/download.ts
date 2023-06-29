import { BUILD_DIR, checkAuth, fetchApi, prepareBuildDir } from './lib.js';
import fs from 'fs/promises'

export const download = async (args) => {
    const projectId = args.positionals[1];
    if (!projectId) {
        throw new Error('No projectId specified.')
    }
    await prepareBuildDir();
    const rawData = `${BUILD_DIR}/${projectId}.json`
    const config = await checkAuth(projectId);
    if (!config) {
        throw new Error('Not logged in');
    }
    const { token, host } = config;
    const webstudioUrl = new URL(host);
    webstudioUrl.pathname = `/rest/buildId/${projectId}`;
    webstudioUrl.searchParams.append('authToken', token);

    console.log(`Getting latest buildId for project ${projectId} from ${webstudioUrl.origin}`)
    const buildIdData = await fetchApi(webstudioUrl.href);
    const { buildId } = buildIdData;
    if (!buildId) {
        throw new Error('Project does not published yet');
    }

    webstudioUrl.pathname = `/rest/build/${buildId}`;
    console.log(`Downloading project ${projectId} from ${webstudioUrl.origin}`)
    const projectData = await fetchApi(webstudioUrl.href);
    await fs.writeFile(rawData, JSON.stringify(projectData));

    console.log(`Project ${projectId} downloaded to ${rawData}`);
    return;
};
export default download;
