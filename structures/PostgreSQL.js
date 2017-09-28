// eslint-disable-next-line max-len
// Original taken from https://github.com/WeebDev/Commando/blob/7e2d6099ef702b26609cd1bd23ed55486483d323/structures/PostgreSQL.js

const Sequelize = require('sequelize');

const Logger = require('./Logger');

/**
 * Singleton Database
 */
class Database {
	/**
	 * Singleton Database instance
	 * @returns {Database}
	 * @static
	 */
	static get instance() {
		return Database._instance || new Database();
	}

	/**
	 * Instantiate the Database singleton
	 * @private
	 */
	constructor() {
		if (Database._instance) {
			throw new Error('Can not create multiple instances of Database singleton!');
		}

		/**
		 * Singleton Database instance
		 * @type {Database}
		 * @private
		 */
		Database._instance = this;
		/**
		 * Reference to the Logger instance
		 * @type {Logger}
		 * @private
		 */
		this.logger = Logger.instance;
		/**
		 * Sequelize connection instance
		 * @type {Sequelize}
		 */
		this.db = new Sequelize('postgres://kanna:kannapw@127.0.0.1:5432/kanna', {
			// For dev logging: false
			retry: { max: 5 }
		});
	}

	/**
	 * Connect to the database and sync the models
	 */
	start() {
		this.db.authenticate()
			.then(() => this.logger.database('[POSTGRES]: Connection to database has been established successfully.'))
			.then(() => this.logger.database('[POSTGRES]: Synchronizing database...'))
			.then(() => this.db.sync()
				.then(() => this.logger.database('[POSTGRES]: Done Synchronizing database!'))
				.catch(error => this.logger.error('[POSTGRES]: Error synchronizing the database:\n', error))
			)
			.catch(error => {
				this.logger.error('[POSTGRES]: Unable to connect to the database: \n', error);
				this.logger.error('[POSTGRES]: Try reconnecting in 5 seconds...');
				setTimeout(() => this.start(), 5000);
			});
	}
}

module.exports = Database;
