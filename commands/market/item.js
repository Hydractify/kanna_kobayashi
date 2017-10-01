const { BOOLEAN, col, ENUM, fn, INTEGER, where } = require('sequelize');
const { inspect } = require('util');

const { instance: { db } } = require('../../structures/PostgreSQL');
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

	run(message, [method, ...args]) {
		if (!method) {
			return message.reply(`you must provide a method! (**\`${this.usage}\`**)`);
		}

		// TODO: Maybe replace this with a `return this[method.toLowerCase()](message, args);`
		// and add aliases via a loop and property descriptors?
		switch (method.toLowerCase()) {
			case 'create':
			case 'make':
			case 'update':
				return this.create(message, args);

			case 'structure':
				return this.structure(message);

			case 'find':
				return this.find(message, args);

			case 'give':
				return this.give(message, args);

			default:
				return message.channel.send(`Unknown method \`${method}\`.`);
		}
	}

	async create(message, args) {
		const userModel = message.author.model || await message.author.fetchModel();
		if (userModel.type !== 'DEV') {
			return message.reply('Only developers can make or update items! <:KannaOmfg:315264558279426048>');
		}

		try {
			const modelData = this._buildModel(parseFlags(args.join(' '), true));
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
		} catch (error) {
			this.handler.logger.error(error);
			return message.channel.send(error.toString(), { code: true });
		}
	}

	async structure(message) {
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

	async find(message, args) {
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

	async give(message, args) {
		const member = await this.handler.resolveMember(message.guild, args[0]);
		if (!member) return message.channel.send(`Couldn't find a member by ${args[0]}.`);

		const item = await Item.findOne({ where: where(fn('lower', col('name')), args.slice(1).join(' ').toLowerCase()) });
		if (!item) {
			return message.channel.send(`Couldn't find an Item or Badge with the name \`${args.slice(1).join(' ')}\``);
		}

		// TODO: Tradable?

		const type = item.type === 'BADGE' ? 'Badge' : 'Item';

		const sourceHasItem = await message.author.model[`has${type}`](item);
		if (!sourceHasItem) return message.channel.send(`You don't have the \`${item.name}\` ${type.toLowerCase()}!`);

		const targetHasItem = await (member.user.model || await member.user.fetchModel())[`has${type}`](item);
		if (targetHasItem) {
			return message.channel.send(`**${member.user.tag}** already has the \`${item.name}\` ${type.toLowerCase()}!`);
		}

		try {
			// Make a transaction to rollback when something fails
			const transaction = await db.transaction();
			await Promise.all([
				message.author.model[`remove${type}`](item, { transaction }),
				member.user.model[`add${type}`](item, { transaction })
			]);
			await transaction.commit();

			return message.channel.send([
				'You successfully transfered your ',
				`\`${item.name}\` ${type.toLowerCase()} to **${member.user.tag}**!`
			]);
		} catch (error) {
			this.handler.logger.error(error);
			return message.channel.send(
				`Something went wrong while transferring your ${type.toLowerCase()}, the transaction has been reverted.`
			);
		}
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
}

module.exports = ItemCommand;
