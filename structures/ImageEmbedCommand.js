const Command = require('./Command');
const RichEmbed = require('./RichEmbed');

/**
 * Abstract ImageEmbedCommand class, which provides an interface for easy embed building.
 * @abstract
 */
class ImageEmbedCommand extends Command {
	/**
	 * Instantiate a new ImageEmbedCommand
	 * @param {CommandHandler} handler Instantiating CommandHandler
	 * @param {CommandOptions} options Regular command options
	 * @param {string|string[]} baseURLOrArray Either the base url or an array of urls
	 * @param {number} [maxNumber] If a base url is passed,
	 * the max number of the file name 
	 */
	constructor(handler, options, baseURLOrArray, maxNumber) {
		super(handler, options);

		if (options.clientPermissions) options.clientPermissions.push('EMBED_LINKS');
		else options.clientPermissions = ['EMBED_LINKS'];

		if (options.messageContent) {
			if (typeof options.messageContent !== 'string') {
				throw new TypeError(`${this.name} messageContent must be a string!`);
			}

			this.messageContent = options.messageContent;
		}

		if (!baseURLOrArray) {
			throw new Error(`${this.name} must be passed an array of urls or a base url and a maxNumber!`);
		}

		if (baseURLOrArray instanceof Array) {
			if (!baseURLOrArray.length) {
				throw new Error(`${this.name}'s url array can't be empty!`);
			}

			this._urlArray = baseURLOrArray;
		} else {
			if (typeof maxNumber !== 'number') {
				throw new Error(`${this.name}'s max number must be a number!`);
			}

			this._baseURL = baseURLOrArray;
			this._maxNumber = maxNumber;
		}
	}

	/**
	 * Builds an embed for this ImageEmbed, picks a random image.
	 * @param {Message} message Incoming message
	 * @param {User} [userModel] Sequelize user model instance
	 * @returns {RichEmbed}
	 */
	imageEmbed(message, userModel) {
		const image = this._baseURL
			? `${this._baseURL}${Math.floor(Math.random() * this._maxNumber) + 1}.gif`
			: this._urlArray[Math.floor(Math.random() * this._urlArray.length)];

		return RichEmbed.image(message, userModel, image);
	}

	/**
	 * Default basic implementation for an image embed command.
	 * @param {Message} message Incoming message
	 * @param {string[]} __ Args
	 * @param {Object} options Additional data
	 * @param {User} options.authorModel Sequelize user model instance
	 * @param {string} options.commandName Name or alias of the called command
	 * @returns {Promise<Message>}
	 * @virtual
	 */
	run(message, __, { authorModel }) {
		const embed = this.imageEmbed(message, authorModel);

		return message.channel.send(this.messageContent, embed);
	}
}

module.exports = ImageEmbedCommand;
