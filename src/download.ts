import { CONFIG_FILE, BUILD_DIR, getConfig } from './lib.js';
import fs from 'fs/promises'

export const download = async (buildId: string) => {
    const rawData = `${BUILD_DIR}/${buildId}.json`
    const config = await getConfig();
    const { url, token } = config;
    const webstudioUrl = new URL(url);
    webstudioUrl.pathname = `/rest/build/${buildId}`;
    const response = await fetch(webstudioUrl.href, {
        method: 'GET',
        credentials: 'include',
        headers: {
            // Session cookie is used for now, but we should use a token instead.
            'Cookie': `_session=${token}`,
        }
    })
    if (!response.ok) {
        if (response.status === 401 || response.status === 500) {
            console.error('Authentication failed.');
        }
        return;
    }
    const data = await response.text();
    await fs.writeFile(rawData, data);
    console.log(`Build ${buildId} downloaded to ${rawData}`);
    return
};
export default download;
