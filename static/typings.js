const { existsSync, writeFileSync } = require('fs');
const { join } = require('path');
const { get } = require('snekfetch');

const sourceURL = 'https://raw.githubusercontent.com/discordjs/discord.js-typings/master/index.d.ts';
const targetPath = join(__dirname,'..', 'node_modules', 'discord.js', 'typings');

if (!existsSync(targetPath)) {
	throw new Error(`${targetPath} does not exist!\nSure discord.js is already installed?`);
}

get(sourceURL)
	.then(({ text }) => writeFileSync(join(targetPath, 'index.d.ts'), text))
	.then(() => {
		console.log('Updated typings');
		process.exit(0);
	})
	.catch((error) => {
		console.error('An error occured while updating the typings:', erro);
		process.exit(1);
	});
