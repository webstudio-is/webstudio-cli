import * as readline from 'node:readline/promises';
import fs from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';
import { CONFIG_FILE } from './lib.js';

export const login = async (url: string | undefined) => {
    const rl = readline.createInterface({ input, output });
    const token = await rl.question(`Authenticate with Token on ${url}: `);
    console.log('Authentication saved.');
    rl.close();
    const config = {
        url,
        token,
    };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    return
};

export default login;