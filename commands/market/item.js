const { BOOLEAN, col, ENUM, fn, INTEGER, where } = require('sequelize');
const { inspect } = require('util');

const { parseFlags } = require('../../util/Util');
const Command = require('../../structures/Command');
const Item = require('../../models/Item');

class ItemCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			exp: 0,
			name: 'item',
			// Literals could be displayed as <Make|See|Give|Etc>
			// Maybe hide DEV only stuff from usage?
			usage: 'item <Method> <...Parameters>',
			permLevel: 0,
			description: 'Check item information, give an item to your friend~~, or make an item if you are a developer~~!'
		});
	}

	async run(message, [method, ...args]) {
		if (!method) {
			return message.reply(`you must provide a method! (**\`${this.usage}\`**)`);
		}

		method = method.toLowerCase();

		if (method === 'make') {
			const userModel = message.author.model || await message.author.fetchModel();
			if (userModel.type !== 'DEV') {
				return message.reply('Only developers can make or update items! <:KannaOmfg:315264558279426048>');
			}

			try {
				const modelData = this._buildModel(parseFlags(args.join(' '), true));
				return await this._createOrUpdateItem(message, modelData);
			} catch (error) {
				this.handler.logger.error(error);
				return message.channel.send(error.toString(), { code: true });
			}
		}

		if (method === 'structure') {
			const userModel = message.author.model || await message.author.fetchModel();
			if (userModel.type !== 'DEV') {
				return message.reply('Only developers can see the structure of items! <:KannaOmfg:315264558279426048>');
			}

			const structure = ['Item {'];
			for (const [name, { type }] of Object.entries(Item.prototype.rawAttributes)) {
				structure.push(`\t${name}: ${type instanceof ENUM ? inspect(type.values) : type.constructor.name},`);
			}
			// Remove dangling comma
			structure[structure.length - 1] = `${structure[structure.length - 1].slice(0, -1)} }`;

			return message.channel.send([
				`${message.author}, here the item structure`,
				'```js',
				structure.join('\n'),
				'```'
			]);
		}

		if (method === 'find') {
			const item = await Item.findOne({ where: where(fn('lower', col('name')), args.join(' ').toLowerCase()) });

			if (!item) return message.channel.send(`${message.author}, could not find an item with that name!`);

			// TODO: User friendly display
			return message.channel.send([
				`${message.author}, your requested item:`,
				'```js',
				'Item {',
				` ${inspect(item.dataValues).slice(1)}`,
				'```'
			]);
		}

		// TODO: I guess more methods like give and show etc.
	}

	/**
	 * Builds a model data object from parsed flags
	 * @param {Collection<string, string>} parsed Parsed flags
	 * @returns {Object} Model data object
	 * @private
	 */
	_buildModel(parsed) {
		const modelData = {};

		for (const [name, data] of parsed) {
			const { type } = Item.prototype.rawAttributes[name] || {};
			// Provided flag is not an attributte of Item
			if (!type) continue;

			if (type instanceof BOOLEAN) {
				if (data.toLowerCase() === 'true') {
					modelData[name] = true;
				} else if (data.toLowerCase() === 'false') {
					modelData[name] = false;
				} else {
					throw new Error(`Supplied "${name}" is not a boolean!`);
				}
			} else if (type instanceof ENUM) {
				for (const value of type.values) {
					// Enums should always be upper case
					if (value === data.toUpperCase()) {
						modelData[name] = value;
						break;
					}
				}

				if (!modelData[name]) {
					throw new Error(`Supplied "${name}" is not a member type of the enum!`);
				}
			} else if (type instanceof INTEGER) {
				const integer = parseInt(data);
				if (isNaN(integer)) {
					throw new Error(`Supplied "${name}" is not an integer!`);
				}
				modelData[name] = integer;
			} else {
				modelData[name] = data;
			}
		}

		return modelData;
	}

	/**
	 * Creates or updates a model
	 * @param {message} message Incoming message
	 * @param {Object} modelData Parsed model data
	 * @return {Promise<Message>}
	 */
	async _createOrUpdateItem(message, modelData) {
		if (!modelData.name) throw new Error('A name is required!');

		let item = await Item.findOne({ where: { name: modelData.name } });

		if (item) {
			item = await item.update(modelData);
			return message.channel.send([
				`${message.author}, I have sucessfully updated the ${item.type[0] + item.type.slice(1).toLowerCase()}!`
				+ ' Here it is... <:KannaAyy:315270615844126720>',
				'```js',
				'Item {',
				` ${inspect(item.dataValues).slice(1)}`,
				'```'
			]);
		}

		item = await Item.create(modelData);
		return message.channel.send([
			`${message.author}, I have sucessfully created the ${item.type[0] + item.type.slice(1).toLowerCase()}!`
			+ ' Here it is... <:KannaAyy:315270615844126720>',
			'```js',
			'Item {',
			` ${inspect(item.dataValues).slice(1)}`,
			'```'
		]);
	}
}

module.exports = ItemCommand;
