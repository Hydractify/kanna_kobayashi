// Original taken from
// https://github.com/WeebDev/Commando/blob/7e2d6099ef702b26609cd1bd23ed55486483d323/structures/Redis.js

const { createClient, Multi, RedisClient } = require('redis');

const { promisifyAll } = require('../util/util');
const Logger = require('./Logger');

promisifyAll(Multi.prototype);
promisifyAll(RedisClient.prototype);

/**
 * Singleton Redis
 */
class Redis {
	/**
	 * Singleton Redis instance
	 * @return {Redis}
	 * @static
	 */
	static get instance() {
		return Redis._instance || new Redis();
	}

	/**
	 * Instantiates the Redis singleton
	 * @private
	 */
	constructor() {
		if (Redis._instance) {
			throw new Error('Can not create multiple instances of Redis singleton!');
		}

		/**
		 * Singleton Redis instance
		 * @type {Redis}
		 * @private
		 */
		Redis._instance = this;
		/**
		 * Reference to the Logger instance
		 * @type {Logger}
		 * @private
		 */
		this.logger = Logger.instance;

		/**
		 * RedisClient instance
		 * @type {RedisClient}
		 */
		this.db = createClient();
	}

	start() {
		this.db.on('error', error => this.logger.error('[REDIS]: Encountered error:', error))
			.on('reconnecting', () => this.logger.debug('[REDIS]: Reconnecting...'));
	}
}

module.exports = Redis;
