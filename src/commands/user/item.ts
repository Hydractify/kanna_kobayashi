import { GuildMember, Message } from 'discord.js';
import { BOOLEAN, col, ENUM, fn, INTEGER, Transaction, where } from 'sequelize';
import { inspect } from 'util';

import { Item } from '../../models/Item';
import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { Logger } from '../../structures/Logger';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { UserTypes } from '../../types/UserTypes';
import { Loggable } from '../../util/LoggerDecorator';
import { FlagCollection, parseFlags, titleCase } from '../../util/Util';

//
// This whole file is a mess
// TODO: Do something against this.
//

@Loggable
class ItemCommand extends Command {
	private logger: Logger;

	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Check an item\'s information or give an item one of your friends!',
			examples: [],
			exp: 0,
			name: 'item',
			usage: 'item <Check|Give> <...Query|Target>',
		});
	}

	public parseArgs(
		message: Message,
		[method, ...args]: string[],
		{ authorModel }: ICommandRunInfo,
	): string | ['create' | 'structure' | 'find' | 'give', string[]] {
		if (!method) return `you must provide a method! (**\`${this.usage}\`**)`;

		switch (method.toLowerCase()) {
			case 'create':
			case 'make':
			case 'update':
				if (authorModel.type !== UserTypes.DEV) {
					return 'only developers can make or update items! <:KannaOmfg:315264558279426048>';
				}

				return ['create', args];

			case 'structure':
				if (authorModel.type !== UserTypes.DEV) {
					return 'only developers can see the structure of items! <:KannaOmfg:315264558279426048>';
				}

				return ['structure', args];

			case 'check':
			case 'find':
				return ['find', args];

			case 'trade':
			case 'give':
				return ['give', args];

			default:
				return `Unknown method \`${method}\`.`;
		}
	}

	public run(
		message: Message,
		[method, ...args]: ['create' | 'structure' | 'find' | 'give', string[]],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		return this[method](message, args as string[], authorModel);
	}

	/**
	 * Builds a model data object from parsed flags
	 * @param parsed Parsed flags
	 * @returns Model data object
	 */
	private _buildModel(parsed: FlagCollection): { [key: string]: string | boolean | number } {
		const modelData: { [key: string]: string | boolean | number } = {};

		for (const [name, data] of parsed) {
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

	private async create(message: Message, args: string[], authorModel: UserModel): Promise<Message | Message[]> {
		try {
			const modelData: { [key: string]: string | number | boolean } = this._buildModel(parseFlags(args.join(' '), true));

			let item: Item = await Item.findOne({ where: { name: modelData.name } });

			if (item) {
				item = await item.update(modelData);

				return message.reply([
					`I have sucessfully updated the ${item.type[0] + item.type.slice(1).toLowerCase()}!`
					+ ' Here it is... <:KannaAyy:315270615844126720>',
					'```js',
					'Item {',
					` ${inspect(item.toJSON()).slice(1)}`,
					'```',
				].join('\n'));
			}

			item = await Item.create(modelData);

			return message.reply([
				`I have sucessfully created the ${item.type[0] + item.type.slice(1).toLowerCase()}!`
				+ ' Here it is... <:KannaAyy:315270615844126720>',
				'```js',
				'Item {',
				` ${inspect(item.toJSON()).slice(1)}`,
				'```',
			].join('\n'));
		} catch (error) {
			return message.channel.send(error.toString(), { code: true });
		}
	}

	private async find(message: Message, args: string[], authorModel: UserModel): Promise<Message | Message[]> {
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
			`Information about the ${item.type.toLowerCase()} "${item.name}"`,
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
				if (item.holders.length) {
					embed.addField('You own', item.userItem.count);
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

	private async give(
		message: Message,
		[target, ...search]: string[],
		authorModel: UserModel,
	): Promise<Message | Message[]> {
		if (!target) return message.reply('you have to tell me who you want to give an item or badge.');
		if (!search.length) return message.reply('you also have to tell me what item or badge you want to give.');

		const member: GuildMember = await this.resolver.resolveMember(target, message.guild, false);
		if (!member) return message.reply(`I could not find a non-bot member by ${target}.`);
		if (member.id === message.author.id) {
			return message.reply('you can not give an item or badge to yourself.');
		}

		const item: Item = await Item.findOne({
			where: where(fn('lower', col('name')), search.join(' ').toLowerCase()) as {},
		});
		if (!item) {
			return message.reply(`I could not find an item or badge with the name \`${search.join(' ')}\``);
		}

		const type: string = item.type === 'BADGE' ? 'Badge' : 'Item';

		const [sourceItem]: Item[] = await authorModel.$get<Item>(`{type}s`, { where: { id: item.id } }) as Item[];
		if (!sourceItem) return message.reply(`you don't have the \`${item.name}\` ${type.toLowerCase()}!`);

		if (!item.tradable) {
			return message.reply(`**${item.name}** may not be traded!`);
		}

		const targetModel: UserModel = await member.user.fetchModel();
		const [targetItem]: Item[] = await targetModel.$get<Item>(`${type}s`, { where: { id: item.id } }) as Item[];
		if (targetItem && item.unique) {
			return message.reply(`**${member.user.tag}** already has the unique \`${item.name}\` ${type.toLowerCase()}!`);
		}

		const singular: boolean = item.unique || sourceItem.userItem.count === 1;
		try {
			const promises: PromiseLike<{}>[] = [];
			// Make a transaction to rollback when something fails
			const transaction: Transaction = await this.sequelize.transaction();

			// If the source has more than one of this item remove one, otherwise remove the whole item
			if (sourceItem.userItem.count > 1) {
				promises.push(sourceItem.userItem.increment('count', { by: -1, transaction }));
			} else {
				promises.push(authorModel.$remove(type, sourceItem, { transaction }));
			}

			// If the target already has that item add one, otherwise add it as whole
			if (targetItem) {
				promises.push(targetItem.userItem.increment('count', { transaction }));
			} else {
				promises.push(targetModel.$add(type, item, { transaction }));
			}

			await Promise.all(promises);
			await transaction.commit();

			return message.reply([
				`you successfully transferred${singular ? '' : ' one of'} your `,
				`\`${item.name}\` ${type.toLowerCase() + singular ? '' : 's'} to **${member.user.tag}**!`,
			].join('\n'));
		} catch (error) {
			this.logger.error(error);

			return message.reply([
				'something went wrong while transferring your',
				`${type.toLowerCase() + singular ? '' : 's'}, the transaction has been reverted.`,
			].join(' '));
		}
	}

	private structure(message: Message, args: string[], authorModel: UserModel): Promise<Message | Message[]> {
		const structure: string[] = ['Item {'];
		for (const [name, { type }] of Object.entries((Item.prototype as any).rawAttributes)) {
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
}

export { ItemCommand as Command };
