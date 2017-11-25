// tslint:disable:no-any member-ordering

import * as moment from 'moment';
import { inspect } from 'util';

import { colors, LogLevel } from '../Types/LogLevel';

export { Loggable } from '../util/LoggerDecorator';

/**
 * Singleton Logger
 */
export class Logger {
	/**
	 * Singleton Logger instance
	 */
	public static get instance(): Logger {
		return this._instance || new this();
	}

	/**
	 * Logger instance
	 */
	private static _instance: Logger;

	/**
	 * Current log level
	 */
	private _logLevel: LogLevel;

	/**
	 * Instantiate the Logger singleton.
	 */
	private constructor() {
		if (Logger._instance) {
			throw new Error('Can not create multiple instances of Logger singleton.');
		}

		this._logLevel = LogLevel.SILLY;

		Logger._instance = this;
	}

	/**
	 * Set the level of logging to output.
	 */
	public setLogLevel(level: LogLevel): void {
		this._logLevel = level;
	}

	/**
	 * Write a messages with the `silly` level to the log if applicable.
	 */
	public async silly(tag: any, ...input: any[]): Promise<void> {
		this._write(LogLevel.SILLY, tag, input);
	}

	/**
	 * Write a messages with the `debug` level to the log if applicable.
	 */
	public async debug(tag: any, ...input: any[]): Promise<void> {
		this._write(LogLevel.DEBUG, tag, input);
	}

	/**
	 * Write a messages with the `verbose` level to the log if applicable.
	 */
	public async verbose(tag: any, ...input: any[]): Promise<void> {
		this._write(LogLevel.VERBOSE, tag, input);
	}

	/**
	 * Write a messages with the `info` level to the log if applicable.
	 */
	public async info(tag: any, ...input: any[]): Promise<void> {
		this._write(LogLevel.INFO, tag, input);
	}

	/**
	 * Write a messages with the `warn` level to the log if applicable.
	 */
	public async warn(tag: any, ...input: any[]): Promise<void> {
		this._write(LogLevel.WARN, tag, input);
	}

	/**
	 * Write a messages with the `error` level to the log if applicable.
	 */
	public async error(tag: any, ...input: any[]): Promise<void> {
		this._write(LogLevel.ERROR, tag, input);
	}

	/**
	 * Convert any data to a string
	 */
	private _prepareText(data: any[]): string {
		const cleaned: string[] = [];
		for (let arg of data) {
			if (typeof arg !== 'string') {
				arg = inspect(arg);
			}

			cleaned.push(arg);
		}

		return cleaned.join(' ');
	}

	/**
	 * Write to the output stream
	 */
	private _write(level: LogLevel, tag: string, data: any[]): void {
		if (this._logLevel < level) return;
		const out: NodeJS.Socket = level > LogLevel.WARN
			? process.stdout
			: process.stderr;
		const cleaned: string = this._prepareText(data);

		// TODO: Maybe a webhook for warn/error messages?

		out.write(
			[
				'\n',
				'SHARD_ID' in process.env
					? `\x1b[32m[SHARD ${process.env.SHARD_ID}\x1b[0m`
					: '',
				`[${moment().format('YYYY.MM.DD-HH:mm:ss')}]`,
				// Background
				`\x1b[${colors[level][0]}m`,
				// Black
				'\x1b[30m',
				`[${LogLevel[level]}]`,
				tag
					? `[${tag}]`
					: '',
				// Reset
				'\x1b[0m: ',
				// Foreground
				`\x1b[${colors[level][1]}m`,
				cleaned,
				// Reset
				'\x1b[0m',
				'\n',
			].join(''),
		);
	}
}
