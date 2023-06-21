import xdgAppPaths from "xdg-app-paths";
import path from "node:path";
import fs from 'fs/promises'
import login from './login.js';
import { Config } from './types.js';

export const BUILD_DIR = 'app';
export const CONFIG_PATH = xdgAppPaths("webstudio").config();
export const CONFIG_FILE = path.join(CONFIG_PATH, "config.json");

export const prepare = async () => {
    await fs.mkdir(BUILD_DIR, { recursive: true });
    await fs.mkdir(`${BUILD_DIR}/template/__generated__`, { recursive: true });
    await fs.mkdir(`${BUILD_DIR}/template/routes`, { recursive: true });
    await fs.mkdir(CONFIG_PATH, { recursive: true });
    await checkConfig();
}
export const checkConfig = async () => {
    try {
        await fs.access(CONFIG_FILE)
    } catch (error) {
        fs.writeFile(CONFIG_FILE, JSON.stringify({}));
    }
}
export const checkAuth = async (url: string | undefined) => {
    const config: Config = await getConfig();
    if (!config || !config.url || config.url !== url || !config.token) {
        console.error('Token not found. Logging in.');
        await login(url);
    }
}

export const getConfig = async () => {
    const config = await fs.readFile(CONFIG_FILE, 'utf-8');
    try {
        const json = JSON.parse(config);
        return json;
    } catch (error) {
        return null;
    }
}