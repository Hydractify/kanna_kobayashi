import { createClient, RedisClient } from 'redis-p';
import { Loggable, Logger } from './Logger';

/**
 * Singleton Redis connection
 */
@Loggable('REDIS')
export class Redis {
	/**
	 * Singleton Redis instance
	 */
	public static get instance(): Redis {
		return this._instance || new this();
	}

	/**
	 * Redis instance
	 */
	private static _instance: Redis;

	/**
	 * RedisClient to interact with redis
	 */
	public readonly db: RedisClient;

	/**
	 * Reference to the Logger instance
	 */
	private readonly logger: Logger;

	/**
	 * Instantiate the Redis singleton
	 */
	private constructor() {
		if (Redis._instance) {
			throw new Error('Can not create multiple instances of Redis singleton!');
		}

		Redis._instance = this;

		this.db = createClient();
	}

	/**
	 * "Start" the redis connection.
	 */
	public start(): void {
		this.db.on('error', (error: Error) => this.logger.error(error))
			.on('reconnecting', () => this.logger.info('Reconnecting...'));
	}
}
