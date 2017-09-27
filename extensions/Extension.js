// eslint-disable-next-line max-len
// Stolen from Yukine https://github.com/Dev-Yukine/Senpai-Bot-Discord/blob/a1402fe805e55ab9c322afc0bc9195bbaebe14ff/src/structures/extension/Extend.js
// ~~Not like it's originally from Commando or something~~

class Extension {
	static extend(target) {
		Object.defineProperties(
			target.prototype,
			Object.getOwnPropertyDescriptors(this.prototype)
		);
	}
}

module.exports = Extension;
