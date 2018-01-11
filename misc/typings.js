const { get } = require('snekfetch');
const { existsSync, writeFileSync } = require('fs');
const { join } = require('path');


const sourceURL = 'https://raw.githubusercontent.com/zajrik/discord.js-typings/master/index.d.ts';
const targetPath = join(__dirname, '..', 'node_modules', 'discord.js', 'typings');

if (!existsSync(targetPath)) {
	throw new Error(`${targetPath} does not exist!\nSure discord.js is already installed?`);
}

get(sourceURL)
	.then(({ text }) => writeFileSync(join(targetPath, 'index.d.ts'), text))
	.then(() => {
		console.log('Successfully updated typings!');
		process.exit(0);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});