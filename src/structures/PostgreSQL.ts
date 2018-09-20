import { join } from 'path';
import { Sequelize } from 'sequelize-typescript';

import { Loggable, Logger } from './Logger';

/**
 * Singleton PostgreSQL connection
 */
@Loggable('POSTGRES')
export class PostgreSQL {
	/**
	 * Singleton PostgreSQL instance
	 */
	public static get instance(): PostgreSQL {
		return this._instance || new this();
	}

	/**
	 * PostgreSQL instance
	 */
	private static _instance: PostgreSQL;

	/**
	 * Sequelize connection instance
	 */
	public readonly db: Sequelize;

	/**
	 * Reference to the Logger instance
	 */
	private readonly logger!: Logger;

	/**
	 * Instantiate the PostgreSQL singleton.
	 */
	private constructor() {
		if (PostgreSQL._instance) {
			throw new Error('Can not create multiple instances from PostgreSQL singleton.');
		}

		PostgreSQL._instance = this;

		this.db = new Sequelize({
			dialect: 'postgres',
			logging: false,
			modelPaths: [join(__dirname, '..', 'models')],
			name: 'kanna',
			password: 'kannapw',
			username: 'kanna',
		});
	}

	/**
	 * Start the PostgreSQL database connection
	 */
	public start(): PromiseLike<void> {
		return this.db.authenticate()
			.then(() => this.logger.info('Connection established successfully.'))
			.catch((error: Error) => this.logger.error(error))
			.then(() => this.db.sync())
			.catch((error: Error) => this.logger.error(error));
	}
}
