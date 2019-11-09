import { Invite, Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { Command as GuildInfoCommand } from './guild';

class LookupCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['ii', 'lookup'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Look up a guild\'s info by an invite link or invite code',
			examples: [
				'lookup uBdXdE9',
				'lookup discord.gg/uBdXdE9',
			],
			usage: 'lookup <invite>',
		});
	}

	public parseArgs(message: GuildMessage, [code]: string[]): string | Promise<string | Invite[]>
	{
		if (!code) return 'you have to give me an invite link or code!';

		return this.client.fetchInvite(code)
			.then((invite: Invite) => ([invite]))
			.catch(() => 'I couldn\'t find a valid invite for this link or code.');
	}

	public async run(
		message: GuildMessage,
		[{ channel, guild, presenceCount, memberCount }]: [Invite],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		// This shard is part of that guild, give full info
		if (this.client.guilds.has(guild!.id))
		{
			return (this.handler.resolveCommand('guildinfo') as GuildInfoCommand).run(
				message,
				[],
				{ args: [], commandName: 'guildinfo', authorModel },
			);
		}

		const iconURL: string | null = guild!.iconURL();

		const createdAt: moment.Moment = moment(guild!.createdAt);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setTitle(`Info about ${guild!.name}`)
			.setThumbnail(iconURL)

			.addField(
				'Guild ID',
				guild!.id,
			)

			.addField(
				'Guild creation',
				createdAt.utc().format('MM/DD/YYYY [(]HH:mm[)]'),
				true,
			)

			.addField(
				'Channel of the invite',
				[
					`• Name: \`${channel.name}\``,
					`• Mention: <#${channel.id}>\n_Note: This mentions only resolves when you are part of this guild._`,
				],
				true,
			)

			.addField(
				'Members',
				[
					`• Online: \`${presenceCount.toLocaleString()}\``,
					`• Total: \`${memberCount.toLocaleString()}\``,
				],
				true,
			);

		return message.channel.send(embed);
	}
}

export { LookupCommand as Command };
