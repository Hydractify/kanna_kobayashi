import { Collection, Message, Role, Snowflake } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { mapIterable, titleCase } from '../../util/Util';

class GuildInfoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['gstats', 'ginfo', 'gg'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Displays information about this guild',
			examples: ['ginfo'],
			exp: 0,
			name: 'guildinfo',
			usage: 'ginfo',
		});
	}

	public async run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const { guild }: Message = message;
		if (guild.memberCount > guild.members.size) await guild.members.fetch();

		const roles: Collection<Snowflake, Role> = guild.roles.clone();
		// Get rid of @everyone
		roles.delete(guild.id);
		const rolesString: string = mapIterable(roles.values());

		const emojis: string = mapIterable(guild.emojis.values());

		const counts: {
			bots: number;
			category: number;
			dm?: number;
			group?: number;
			text: number;
			unknown?: number;
			users: number;
			voice: number;
		} = { bots: 0, category: 0, text: 0, users: 0, voice: 0 };
		for (const { user: { bot } } of guild.members.values()) {
			++counts[bot ? 'bots' : 'users'];
		}
		for (const { type } of guild.channels.values()) {
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
			.addField('Owner', `Tag: ${guild.owner.user.tag}\nID: ${guild.owner.id}`, true)

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
				`Total: ${guild.channels.size}`,
				`Category: ${counts.category}`,
				`Text: ${counts.text}`,
				`Voice: ${counts.voice}`,
			],
			true,
			)

			.addField('Role count', guild.roles.size, true)
			.addField('Emoji count', guild.emojis.size, true)
			.addField('Roles', rolesString || 'None', true)
			.addField('Emojis', emojis || 'None', true);

		return message.channel.send(embed);
	}
}

export { GuildInfoCommand as Command };