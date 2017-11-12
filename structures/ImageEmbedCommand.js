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
	 * @param {CommandOptions} options Command options, including baseURL and maxNumber or images
	 * the max number of the file name
	 */
	constructor(handler, options) {
		super(handler, options);

		if (options.clientPermissions) options.clientPermissions.push('EMBED_LINKS');
		else options.clientPermissions = ['EMBED_LINKS'];

		if (options.messageContent) {
			if (typeof options.messageContent !== 'string') {
				throw new TypeError(`${this.name} messageContent must be a string!`);
			}

			this.messageContent = options.messageContent;
		}

		if (options.baseURL) {
			if (typeof options.maxNumber !== 'number') {
				throw new Error(`${this.name}'s max number must be a number!`);
			}

			this._baseURL = options.baseURL;
			this._maxNumber = options.maxNumber;
		} else if (options.images) {
			if (!options.images.length) {
				throw new Error(`${this.name}'s url array can't be empty!`);
			}

			this._images = options.images;
		} else {
			throw new Error(`${this.name}'s options are missing a base URL or an images array!`);
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
			: this._images[Math.floor(Math.random() * this._images.length)];

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
