const { Client: DJSClient } = require('discord.js');
const Logger = require('./Logger');

/**
 * Represents the Client used to interace with discord; an extended discord.js Client
 */
class Client extends DJSClient {
	/**
	 * Instantiate a new Client
	 * @param {ClientOptions} options Options for the discord.js Client
	 */
	constructor(options) {
		super(options);

		this.logger = Logger.instance;

		this.on('ready', this._onReady);
	}

	/**
	 * Run when the client is ready
	 * @private
	 */
	_onReady() {
		this.logger.bot(`Logged in as ${this.user.tag} (${this.user.id})`);
	}
}

module.exports = Client;
