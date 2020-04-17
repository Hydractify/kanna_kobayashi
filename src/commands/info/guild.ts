import { User, Guild, Message, Role, Snowflake } from 'discord.js';
import * as moment from 'moment';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { mapIterable, titleCase } from '../../util/Util';

class GuildInfoCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['ginfo', 'gg'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Inspect information about this guild',
			examples: ['guildinfo'],
			usage: 'guildinfo',
		});
	}

	public async run(message: GuildMessage, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]>
	{
		const embed: MessageEmbed = await this.getEmbed(message, message.guild, authorModel);

		return message.channel.send(embed);
	}


	public async getEmbed(message: GuildMessage, guild: Guild, authorModel: UserModel): Promise<MessageEmbed>
	{
		if (guild.memberCount > guild.members.cache.size) await guild.members.fetch();

		const ownerUser: User = this.client.users.cache.get(guild.ownerID) || await this.client.users.fetch(guild.ownerID);

		const roles: Map<Snowflake, Role> = new Map(guild.roles.cache.entries());
		// Get rid of @everyone
		roles.delete(guild.id);
		const rolesString: string = mapIterable(roles.values());

		const emojis: string = mapIterable(guild.emojis.cache.values());

		const counts: {
			bots: number;
			category: number;
			dm: number;
			group: number;
			text: number;
			news: number;
			store: number;
			unknown: number;
			users: number;
			voice: number;
		} = { bots: 0, category: 0, dm: 0, group: 0, text: 0, news: 0, store: 0, unknown: 0, users: 0, voice: 0 };
		for (const { user: { bot } } of guild.members.cache.values())
		{
			++counts[bot ? 'bots' : 'users'];
		}
		for (const { type } of guild.channels.cache.values())
		{
			++counts[type];
		}

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setThumbnail(guild.iconURL())
			.setAuthor(`${guild.name}'s stats`, guild.iconURL())
			.setDescription('\u200b')

			.addField('Guild ID', guild.id, true)

			.addField(
				'Server region',
				titleCase(guild.region.replace(/_/g, ' ')),
				true,
			)

			.addField(
				'Guild creation',
				moment(guild.createdTimestamp).format('MM/DD/YYYY [(]HH:mm[)]'),
				true,
			)
			.addField('Owner', `Tag: ${ownerUser.tag}\nID: ${ownerUser.id}`, true)

			.addField(
				'Members',
				[
					`Total: ${guild.memberCount}`,
					`Users: ${counts.users}`,
					`Bots: ${counts.bots}`,
				],
				true,
			)

			.addField(
				'Channels',
				[
					`Total: ${guild.channels.cache.size}`,
					`Category: ${counts.category}`,
					`Text: ${counts.text}`,
					`Voice: ${counts.voice}`,
				],
				true,
			)

			.addField('Role count', guild.roles.cache.size, true)
			.addField('Emoji count', guild.emojis.cache.size, true)
			.addField('Roles', rolesString || 'None', true)
			.addField('Emojis', emojis || 'None', true);

		return embed;
	}
}

export { GuildInfoCommand as Command };
