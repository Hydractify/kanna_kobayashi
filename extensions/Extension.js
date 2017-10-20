const { readdir } = require('fs');
const { basename } = require('path');
const { promisify } = require('util');

const readdirAsync = promisify(readdir);

// eslint-disable-next-line max-len
// Stolen from Yukine https://github.com/Dev-Yukine/Senpai-Bot-Discord/blob/a1402fe805e55ab9c322afc0bc9195bbaebe14ff/src/structures/extension/Extend.js
// ~~Not like it's originally from Commando or something~~

/**
 * Applies all extension in the 'extensions' folders to their respective targets.
 */
async function extendAll() {
	const files = await readdirAsync(__dirname);
	for (const file of files) {
		if (file === basename(__filename)) continue;
		const { Extension, Target } = require(`./${file}`);
		Extension.extend(Target);
	}
}

class Extension {
	static extend(target) {
		Object.defineProperties(
			target.prototype,
			Object.getOwnPropertyDescriptors(this.prototype)
		);
	}
}

module.exports = {
	extendAll,
	Extension
};
