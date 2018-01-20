import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { get } from 'snekfetch';

import { Logger } from '../structures/Logger';

const sourceURL = 'https://raw.githubusercontent.com/discordjs/discord.js-typings/master/index.d.ts';
const targetPath = join(__dirname, '..', '..', 'node_modules', 'discord.js', 'typings');

if (!existsSync(targetPath)) {
	throw new Error(`${targetPath} does not exist!\nSure discord.js is already installed?`);
}

get(sourceURL)
	.then(({ text }) => writeFileSync(join(targetPath, 'index.d.ts'), text))
	.then(() => {
		Logger.instance.info('SUCESS', 'Updated typings!');
		process.exit(0);
	})
	.catch((error) => {
		Logger.instance.error(error);
		process.exit(1);
	});
