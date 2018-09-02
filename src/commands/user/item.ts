import { Message } from 'discord.js';
import { BOOLEAN, col, ENUM, fn, INTEGER, where } from 'sequelize';
import { inspect } from 'util';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { UserTypes } from '../../types/UserTypes';
import { FlagCollection, parseFlags, titleCase } from '../../util/Util';

//
// This whole file is a mess
// TODO: Do something against this.
//

class ItemCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Check an item\'s information or give an item one of your friends!',
			examples: ['item check patron'],
			name: 'item',
			usage: 'item <Target>',
		});
	}

	public parseArgs(
		message: Message,
		[method, ...args]: string[],
		{ authorModel }: ICommandRunInfo,
	): string | ['create' | 'structure' | 'find' | 'give', string[]] {
		if (!method) return `you must provide a target! (**\`${this.usage}\`**)`;

		switch (method.toLowerCase()) {
			case 'create':
			case 'make':
			case 'update':
				if (authorModel.type !== UserTypes.DEV) {
					return 'only developers can make or update items! <:kannaMad:458776169924526093>';
				}

				return ['create', args];

			case 'structure':
				if (authorModel.type !== UserTypes.DEV) {
					return 'only developers can see the structure of items! <:kannaMad:458776169924526093>';
				}

				return ['structure', args];

			default:
				return ['find', [method, ...args]];
		}
	}

	public run(
		message: Message,
		[method, args]: ['create' | 'structure' | 'find', string[]],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		return this[method](message, args as string[], authorModel);
	}

	protected async create(message: Message, args: string[], authorModel: UserModel): Promise<Message | Message[]> {
		try {
			const modelData: { [key: string]: string | number | boolean } = this._buildModel(parseFlags(args.join(' '), true));

			let item: Item = await Item.findOne({ where: { name: modelData.name } });

			if (item) {
				item = await item.update(modelData);

				return message.reply([
					`I have sucessfully updated the ${item.type[0] + item.type.slice(1).toLowerCase()}!`
					+ ' Here it is... <:kannaShy:458779242696540170>',
					'```js',
					'Item {',
					` ${inspect(item.toJSON()).slice(1)}`,
					'```',
				].join('\n'));
			}

			item = await Item.create(modelData);

			return message.reply([
				`I have sucessfully created the ${item.type[0] + item.type.slice(1).toLowerCase()}!`
				+ ' Here it is... <:kannaShy:458779242696540170>',
				'```js',
				'Item {',
				` ${inspect(item.toJSON()).slice(1)}`,
				'```',
			].join('\n'));
		} catch (error) {
			return message.channel.send(error.toString(), { code: true });
		}
	}

	protected async find(message: Message, args: string[], authorModel: UserModel): Promise<Message | Message[]> {
		const item: Item = await Item.findOne({
			include: [{
				as: 'holders',
				model: UserModel,
				required: false,
				through: { attributes: ['count'] },
				where: { id: message.author.id },
			}],
			where: where(fn('lower', col('name')), args.join(' ').toLowerCase()) as {},
		});
		if (!item) return message.reply('could not find an item with that name!');

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(
			`Information about the ${item.type.toLowerCase()} "${titleCase(item.name)}"`,
			this.client.user.displayAvatarURL(),
		)
			.setThumbnail(message.guild.iconURL())
			.setDescription(item.description || '\u200b');

		for (let [title, value] of Object.entries(item.toJSON())) {
			// Don't show price for non buyable items
			if ((title === 'price' && value === null)
				// Already in the description of the embed.
				|| title === 'description') continue;

			if (title === 'holders') {
				// Sequelize is weird
				const [holder]: any = item.holders;
				if (holder) {
					embed.addField('You own', holder.UserItem.count);
				}
				continue;
			}

			if (value === true) {
				value = 'Yes';
			} else if (value === false) {
				value = 'No';
			} else {
				value = titleCase(String(value));
			}

			embed.addField(titleCase(title), value, true);
		}

		return message.channel.send(embed);
	}

	protected structure(message: Message, args: string[], authorModel: UserModel): Promise<Message | Message[]> {
		const structure: string[] = ['Item {'];
		for (const [name, { type }] of Object.entries<any>((Item.prototype as any).rawAttributes)) {
			structure.push(`\t${name}: ${type instanceof ENUM ? inspect(type.values) : type.constructor.name},`);
		}
		// Remove dangling comma
		structure[structure.length - 1] = `${structure[structure.length - 1].slice(0, -1)} }`;

		return message.reply([
			'here the item structure.',
			'```js',
			structure.join('\n'),
			'```',
		]);
	}

	/**
	 * Builds a model data object from parsed flags
	 * @param parsed Parsed flags
	 * @returns Model data object
	 */
	private _buildModel(parsed: FlagCollection): { [key: string]: string | boolean | number } {
		const modelData: { [key: string]: string | boolean | number } = {};

		for (const [name, data] of parsed) {
			if (typeof name === 'symbol') continue;
			const { type }: any = (Item.prototype as any).rawAttributes[name] || {};
			// Provided flag is not an attributte of Item
			if (!type) continue;

			if (type instanceof (BOOLEAN as any)) {
				if ((data as string).toLowerCase() === 'true') {
					modelData[name] = true;
				} else if ((data as string).toLowerCase() === 'false') {
					modelData[name] = false;
				} else {
					throw new Error(`Supplied "${name}" is not a boolean!`);
				}
			} else if (type instanceof ENUM) {
				for (const value of type.values) {
					// Enums should always be upper case
					if (value === (data as string).toUpperCase()) {
						modelData[name] = value;
						break;
					}
				}

				if (!modelData[name]) {
					throw new Error(`Supplied "${name}" is not a member type of the enum!`);
				}
			} else if (type instanceof INTEGER) {
				const integer: number = parseInt(data as string);
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

export { ItemCommand as Command };
