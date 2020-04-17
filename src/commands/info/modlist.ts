import { GuildMember, Message, Collection } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { mapIterable, titleCase } from '../../util/Util';
import { Snowflake } from 'discord.js';

class ModListCommand extends Command
{
	private statuses: Map<string, string> = new Map<string, string>([
		['online', Emojis.Online],
		['idle', Emojis.Idle],
		['dnd', Emojis.DND],
		['offline', Emojis.Offline],
	]);

	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['mods'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'In need of a list of mods for this guild?',
			examples: ['modlist online', 'modlist dnd'],
			usage: 'modlist [status]',
		});
	}

	public modList(
		message: GuildMessage,
		members: Collection<Snowflake, GuildMember>,
		authorModel: UserModel,
	): Promise<Message | Message[]>
	{
		const mods: { [key: string]: Set<string> } = {
			dnd: new Set<string>(),
			idle: new Set<string>(),
			offline: new Set<string>(),
			online: new Set<string>(),
		};

		for (const member of members.values())
		{
			if (member.user.bot) continue;
			if (!member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS'])) continue;
			mods[member.presence.status].add(member.toString());
		}

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(message.guild.name)}'s Mod List`, this.client.user!.avatarURL())
			.setThumbnail(message.guild.iconURL())
			.setDescription('This list is populated with all members that can ban and kick members.');

		for (const [status, emoji] of this.statuses)
		{
			if (mods[status].size)
			{
				embed.addField(`${titleCase(status)} ${emoji}`, mapIterable(mods[status]), true);
			}
		}

		return message.channel.send(embed);
	}

	public parseArgs(message: GuildMessage, [input]: string[]): [string | undefined] | string
	{
		if (!input) return [undefined];

		input = input.toLowerCase();
		if (this.statuses.has(input)) return [input];

		return `"${input}" is not a valid status! Valid statuses are ${Array.from(this.statuses.keys()).join(', ')}`;
	}

	public async run(message: GuildMessage, [status]: [string | undefined], { authorModel }: ICommandRunInfo): Promise<Message | Message[]>
	{
		if (message.guild.memberCount !== message.guild.members.cache.size) await message.guild.members.fetch();

		if (!status) return this.modList(message, message.guild.members.cache, authorModel);

		const mods: Set<string> = new Set();
		for (const member of message.guild.members.cache.values())
		{
			if (member.presence.status !== status) continue;
			if (member.user.bot) continue;
			if (member.permissions.has(['KICK_MEMBERS', 'BAN_MEMBERS'])) mods.add(member.toString());
		}
		if (!mods.size) return message.reply(`there are no **${status}** mods!`);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${titleCase(message.guild.name)}'s Mod List`, this.client.user!.avatarURL())
			.setDescription('This list is populated with all members that can ban and kick members.')
			.addField(`${titleCase(status)} Mods`, mapIterable(mods.values()));

		return message.channel.send(embed);
	}
}

export { ModListCommand as Command };
