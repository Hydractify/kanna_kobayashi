// eslint-disable-next-line max-len
// See https://github.com/SpaceEEC/special-journey/blob/1a7084e0d45b6cc2a8c52c4e716215cf352b5e8b/src/Structures/Logger.ts
// And linked sources

const moment = require('moment');
const { inspect } = require('util');

/**
 * Singleton Logger
 */
class Logger {
	/**
	 * Singleton Logger instance
	 * @returns {Logger}
	 * @static
	 */
	static get instance() {
		return Logger._instance || new Logger();
	}

	/**
	 * Instantiate the Logger singleton
	 * @private
	 */
	constructor() {
		if (Logger._instance) {
			throw new Error('Can not create multiple instances of Logger singleton!');
		}

		/**
		 * Singleton Logger instance
		 * @type {Logger}
		 * @private
		 */
		Logger._instance = this;
	}

	/**
	 * Writes a BOT (pink-ish) message to the log.
	 * @param {...any} data Data to log
	 */
	bot(...data) {
		this._write('BOT', data);
	}

	/**
	 * Writes a DATABASE (white) message to the log.
	 * @param {...any} data Data to log
	 */
	database(...data) {
		this._write('DATABASE', data);
	}

	/**
	 * Writes a ERROR (red) message to the log.
	 * @param {...any} data Data to log
	 */
	error(...data) {
		this._write('ERROR', data);
	}

	/**
	 * Writes a LOAD (yellow) message to the log.
	 * @param {...any} data Data to log
	 */
	load(...data) {
		this._write('LOAD', data);
	}

	/**
	 * Writes a SENTRY (green) message to the log.
	 * @param {...any} data Data to log
	 */
	sentry(...data) {
		this._write('SENTRY', data);
	}

	/**
	 * Writes a SHARD (cyan) message to the log.
	 * @param {...any} data Data to log
	 */
	shard(...data) {
		this._write('SHARD', data);
	}

	/**
	 * Writes a DEBUG message to the log.
	 * (Only in dev environment)
	 * @param {...any} data Data to log
	 */
	debug(...data) {
		if (process.env.NODE_ENV !== 'dev') return;
		this._write('DEBUG', data);
	}

	/**
	 * Converts any data to a string.
	 * @param {any[]} data Data to clean
	 * @returns {string}
	 * @private
	 */
	_prepareText(data) {
		const cleaned = [];
		for (let arg of data) {
			if (typeof arg !== 'string') arg = inspect(arg);
			cleaned.push(arg);
		}
		return cleaned.join(' ');
	}

	/**
	 * Actually writes to the stdout
	 * @param {string} level The "level" of this message
	 * @param {any[]} data The data to write
	 * @private
	 */
	_write(level, data) {
		const cleaned = this._prepareText(data);

		process.stdout.write(
			[
				'\n',
				'SHARD_ID' in process.env ? `\x1b[32m[SHARD ${process.env.SHARD_ID}]\x1b[0m` : '',
				`[${moment().format('YYYY.MM.DD-HH:mm:ss')}]`,
				`\x1b[${levels[level][0]}m`,
				'\x1b[30m',
				`[${level}]`,
				'\x1b[0m: ',
				`\x1b[${levels[level][1]}m`,
				cleaned,
				'\x1b[0m',
				'\n'
			].join('')
		);
	}
}

const levels = {
	BOT: [45, 35],
	DATABASE: [47, 37],
	ERROR: [41, 31],
	LOAD: [43, 33],
	SENTRY: [42, 32],
	SHARD: [46, 36],
	DEBUG: [44, 37]
};

module.exports = Logger;
