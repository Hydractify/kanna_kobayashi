// tslint:disable:member-ordering

import * as moment from 'moment';
import { captureBreadcrumb } from 'raven';
import { inspect } from 'util';

import { colors, LogLevel } from '../types/LogLevel';

export { Loggable } from '../decorators/LoggerDecorator';

type LevelFunctions = 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error'
/**
 * A logger, except that the logging functions do not accept a tag anymore.
 */
export type AttachedLogger = Omit<Logger, LevelFunctions> & Record<LevelFunctions, (...input: any[]) => Promise<void>>;

/**
 * Singleton Logger
 */
export class Logger
{
	/**
	 * Singleton Logger instance
	 */
	public static get instance(): Logger
	{
		return this._instance || new this();
	}

	/**
	 * Logger instance
	 */
	protected static _instance: Logger;

	/**
	 * Current log level
	 */
	protected _logLevel: LogLevel;

	/**
	 * Instantiate the Logger singleton.
	 */
	protected constructor()
	{
		if ((this.constructor as typeof Logger)._instance)
		{
			throw new Error('Can not create multiple instances of Logger singleton.');
		}

		this._logLevel = LogLevel.SILLY;

		(this.constructor as typeof Logger)._instance = this;
	}

	/**
	 * Set the level of logging to output.
	 */
	public setLogLevel(level: LogLevel): void
	{
		this._logLevel = level;
	}

	/**
	 * Write a messages with the `silly` level to the log if applicable.
	 */
	public async silly(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.SILLY, tag, input);
	}

	/**
	 * Write a messages with the `debug` level to the log if applicable.
	 */
	public async debug(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.DEBUG, tag, input);
	}

	/**
	 * Write a messages with the `verbose` level to the log if applicable.
	 */
	public async verbose(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.VERBOSE, tag, input);
	}

	/**
	 * Write a messages with the `info` level to the log if applicable.
	 */
	public async info(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.INFO, tag, input);
	}

	/**
	 * Write a messages with the `warn` level to the log if applicable.
	 */
	public async warn(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.WARN, tag, input);
	}

	/**
	 * Write a messages with the `error` level to the log if applicable.
	 */
	public async error(tag: string, ...input: any[]): Promise<void>
	{
		this._write(LogLevel.ERROR, tag, input);
	}

	/**
	 * The tag used for the current process.
	 *
	 * - If this is a shard process `SHARD $SHARD_ID`
	 * - If this is a sharding manager process `MANAGER`
	 * - Otherwise (read: scripts) `GLOBAL`
	 */
	protected get _processTag(): string
	{
		if (process.env.SHARDS) return `SHARD ${process.env.SHARDS}`;
		if (process.env.SHARDING_MANAGER) return 'MANAGER';
		return 'GLOBAL';
	}

	/**
	 * Convert any data to a string
	 */
	protected _prepareText(data: any[]): string
	{
		const cleaned: string[] = [];
		for (let arg of data)
		{
			if (typeof arg !== 'string')
			{
				arg = inspect(arg);
			}

			cleaned.push(arg);
		}

		return cleaned.join(' ');
	}

	protected _capture(level: LogLevel, tag: string, data: string): void
	{
		let sentryLevel: string;

		switch (level)
		{
			case LogLevel.WARN:
				sentryLevel = 'warning';
				break;
			case LogLevel.SILLY:
				sentryLevel = 'debug';
				break;
			case LogLevel.VERBOSE:
				sentryLevel = 'debug';
				break;
			default:
				sentryLevel = LogLevel[level].toLowerCase();
				break;
		}

		captureBreadcrumb({
			category: 'console',
			level: sentryLevel,
			message: data,
		});
	}

	/**
	 * Write to the output stream
	 */
	protected _write(level: LogLevel, tag: string, data: any[]): void
	{
		const cleaned: string = this._prepareText(data);
		this._capture(level, tag, cleaned);

		if (this._logLevel < level) return;
		const out: NodeJS.WritableStream = level > LogLevel.WARN
			? process.stdout
			: process.stderr;

		out.write(
			[
				'\n',
				`\x1b[32m[${this._processTag}]\x1b[0m`,
				`[${moment().format('YYYY.MM.DD-HH:mm:ss')}]`,
				// Background
				`\x1b[${colors[level][0]}m`,
				// Black
				'\x1b[30m',
				`[${LogLevel[level].padStart(5, ' ')}]`,
				// Reset
				'\x1b[0m',
				tag
					? `[${tag}]: `
					: ': ',
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
