import { BUILD_DIR, checkAuth, fetchApi } from './lib.js';
import fs from 'fs/promises'

export const download = async (projectId: string) => {
    const rawData = `${BUILD_DIR}/sitedata.json`
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
        console.error('Project does not published yet');
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
