const { existsSync, createWriteStream } = require('fs');
const { join } = require('path');
const { get } = require('snekfetch');

const sourceURL = 'https://raw.githubusercontent.com/discordjs/discord.js-typings/master/index.d.ts';
const targetPath = join(__dirname, '..', 'node_modules', 'discord.js', 'typings');

if (!existsSync(targetPath)) {
	throw new Error(`${targetPath} does not exist!\nSure discord.js is already installed?`);
}

get(sourceURL)
	.on('error', (...error) => {
		console.log('An error occured while updating the typings:', error);
		process.exit(1);
	})
	.pipe(createWriteStream(join(targetPath, 'index.d.ts')))
	.on('close', () => {
		console.log('Updated typings');
	});
