const { Collection } = require('discord.js');

/**
 * Static util class which has all sorts of handy methods
 * @static
 */
class Util {
	/**
	 * To title cases the passed string
	 * @param {string} string String to title case
	 * @returns {string}
	 * @static
	 */
	static titleCase(string) {
		const titleCased = [];
		for (const word of string.split(' ')) {
			titleCased.push(`${word[0].toUpperCase() + word.slice(1).toLowerCase()}`);
		}

		return titleCased.join(' ');
	}

	/**
	 * Parses flags from a string
	 * Duplicated entries will only return the content of the last one
	 * @param {string} input String to parse
	 * @param {boolean} lowercase Whether the keys should be lowercased automatically
	 * @returns {Collection<string, string>}
	 * @static
	 */
	static parseFlags(input, lowercase) {
		// Scary regex magic
		const regex = /--(\w+) (.+?(?=--|$))/g;
		const parsed = new Collection();

		let match = null;
		while ((match = regex.exec(input)) !== null) {
			parsed.set(lowercase ? match[1].toLowerCase() : match[1], match[2].trim());
		}

		return parsed;
	}
}

module.exports = Util;
