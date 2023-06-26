import { BUILD_DIR, checkAuth } from './lib.js';
import fs from 'fs/promises'

export const download = async (projectId: string) => {
    const rawData = `${BUILD_DIR}/sitedata.json`
    const config = await checkAuth(projectId);
    if (!config) {
        throw new Error('Not logged in');
    }
    const { token, host } = config;
    const webstudioUrl = new URL(host);
    webstudioUrl.pathname = `/rest/project/${projectId}`;
    webstudioUrl.searchParams.append('authToken', token);
    console.log(`Downloading project ${projectId} from ${webstudioUrl.origin}`)
    const response = await fetch(webstudioUrl.href, {
        method: 'GET',
    })
    const data = await response.text();
    if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 500) {
            if (data) {
                console.error(data);
                throw new Error(data);
            } else {
                console.error('Internal server error');
                throw new Error('Internal server error');
            }
        }
        return;
    }
    await fs.writeFile(rawData, data);
    console.log(`Project ${projectId} downloaded to ${rawData}`);
    return
};
export default download;
