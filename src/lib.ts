import 'zx/globals';
import xdgAppPaths from "xdg-app-paths";
import path from "node:path";
import fs from 'fs/promises'
import { Auth, Config } from './types.js';
import { deepmerge } from "deepmerge-ts";
import login from './login.js';
import packageJson from '../package.json' assert { type: "json" };
export const VERSION = packageJson.version;
let currentTries = 0;
export const MAX_TRIES = 3;
export const BUILD_DIR = 'app';
export const CONFIG_PATH = xdgAppPaths("webstudio").config();
export const CONFIG_FILE = path.join(CONFIG_PATH, "config.json");
export const supportedBuildTypes = ['remix-app-server', 'express', 'architect', 'flyio', 'netlify', 'vercel', 'cloudflare-pages', 'cloudflare-workers', 'deno'];

const HELP = `Usage:
    $ webstudio commands [flags...]
  Commands:
    login <shared link>             Login to Webstudio with shared link
    download <projectId>            Download a project's site data
    build [projectId]               Build a site (default: use pre-downloaded data at './app/<projectId>.json')
    serve                           Serve a site locally
  Flags:
    --type, -t                      Build type chosen during build command (default: remix-app-server) 
                                    (options: ${supportedBuildTypes.join(', ')})
    --debug                         Enable debug mode
    --help, -h                      Show this help message
    --version, -v                   Show the version of this script
`;
export const showHelp = () => {
    console.log(HELP);
}
export const prepareConfigPath = async () => {
    await $`mkdir -p ${CONFIG_PATH}`
    await checkConfig();
}
export const prepareBuildDir = async () => {
    await $`rm -rf ${BUILD_DIR}`;
    await $`mkdir -p ${BUILD_DIR}/app/__generated__`;
    await $`mkdir -p ${BUILD_DIR}/app/routes`;
}
export const checkSiteData = async (args) => {
    const projectId = args.positionals[1];
    return await $`ls -1 app/${projectId}.json > /dev/null 2>&1`.exitCode;
}

export const prepareDefaultRemixConfig = async (type: string) => {
    console.log(`Preparing default configurations for ${type}...`)
    await $`cp ./templates/defaults/root.tsx ./${BUILD_DIR}/app`
    const def = await fs.readFile('./templates/defaults/package.json', 'utf-8');
    const defaultJson = JSON.parse(def);
    const template = await fs.readFile(`./templates/${type}/package.json`, 'utf-8');
    const templateJson = JSON.parse(template);
    const merged = deepmerge(defaultJson, templateJson);
    await fs.writeFile(`./${BUILD_DIR}/package.json`, JSON.stringify(merged, null, 2));

    await $`cp ./templates/defaults/template.tsx ./${BUILD_DIR}`
    await $`cp ./templates/defaults/remix.config.js ./${BUILD_DIR}`

    switch (type) {
        case 'express':
            await $`cp ./templates/${type}/server.js ./${BUILD_DIR}`
            break;
        case 'architect':
            await $`cp ./templates/${type}/server.ts ./${BUILD_DIR}`
            await $`cp -Pr ./templates/${type}/server/ ./${BUILD_DIR}`
            await $`cp -Pr ./templates/${type}/app.arc ./${BUILD_DIR}`
            break;
        case 'flyio':
            await $`cp ./templates/${type}/remix.config.js ./${BUILD_DIR}`
            break;
        case 'netlify':
            await $`cp ./templates/${type}/remix.config.js ./${BUILD_DIR}`
            await $`cp ./templates/${type}/server.ts ./${BUILD_DIR}`
            await $`cp ./templates/${type}/netlify.toml ./${BUILD_DIR}`
            break;
        case 'vercel':
            await $`cp ./templates/${type}/remix.config.js ./${BUILD_DIR}`
            await $`cp ./templates/${type}/server.ts ./${BUILD_DIR}`
            break;
        case 'cloudflare-pages':
            await $`cp ./templates/${type}/remix.config.js ./${BUILD_DIR}`
            await $`cp ./templates/${type}/server.ts ./${BUILD_DIR}`
            await $`cp ./templates/${type}/wrangler.toml ./${BUILD_DIR}`
            await $`cp ./templates/${type}/.node-version ./${BUILD_DIR}`
            await $`cp ./templates/${type}/template.tsx ./${BUILD_DIR}`
            await $`cp -Pr ./templates/${type}/public ./${BUILD_DIR}/public`
            break;
        case 'cloudflare-workers':
            await $`cp ./templates/${type}/remix.config.js ./${BUILD_DIR}`
            await $`cp ./templates/${type}/server.ts ./${BUILD_DIR}`
            await $`cp ./templates/${type}/wrangler.toml ./${BUILD_DIR}`
            await $`cp ./templates/${type}/template.tsx ./${BUILD_DIR}`
            break;
        case 'deno':
            await $`cp ./templates/${type}/remix.config.js ./${BUILD_DIR}`
            await $`cp ./templates/${type}/server.ts ./${BUILD_DIR}`
            await $`cp ./templates/${type}/deno.json ./${BUILD_DIR}`
            await $`cp ./templates/${type}/template.tsx ./${BUILD_DIR}`
            await $`cp -Pr ./templates/${type}/.vscode ./${BUILD_DIR}`
    }

}
export const checkConfig = async () => {
    try {
        await fs.access(CONFIG_FILE)
    } catch (error) {
        fs.writeFile(CONFIG_FILE, JSON.stringify({}));
    }
}
export const checkAuth = async (projectId: string): Promise<Auth> => {
    if (currentTries >= MAX_TRIES) {
        throw new Error('Too many tries, please login again.');
    }
    let config: Config = await getConfig();
    let found: Auth = config[projectId];
    if (!found) {
        console.log(`Credentials not found for project ${projectId}\n`)
        await login();
        currentTries++;
        return await checkAuth(projectId);
    }
    return found;
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
export const fetchApi = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
    })
    const data = await response.json();
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
    }
    return data;
}