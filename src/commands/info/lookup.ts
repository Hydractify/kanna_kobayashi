import { Guild, Invite, Message } from 'discord.js';
import * as moment from 'moment';

import { User as UserModel } from '../../models/User';
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

	public async parseArgs(message: GuildMessage, [code]: string[]): Promise<string | [Invite]>
	{
		if (!code) return 'you have to give me an invite link or code!';

		try
		{
			const invite: Invite = await this.client.fetchInvite(code);

			if (!invite.guild) return 'this invite is not for a guild.';

			return [invite];
		}
		catch
		{
			return 'I couldn\'t find a valid invite for this link or code.';
		}
	}

	public async run(
		message: GuildMessage,
		[invite]: [Invite],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const guild: Guild | undefined = this.client.guilds.cache.get(invite.guild!.id);
		const embed: MessageEmbed = guild
			? await this._getLocalGuildEmbed(message, guild, authorModel)
			: this._getRemoteGuildEmbed(message, invite, authorModel);

		return message.channel.send(embed);
	}

	private _getLocalGuildEmbed(message: GuildMessage, guild: Guild, authorModel: UserModel): Promise<MessageEmbed>
	{
		return (this.handler.resolveCommand('guildinfo') as GuildInfoCommand).getEmbed(
			message,
			guild,
			authorModel
		);
	}

	private _getRemoteGuildEmbed(message: GuildMessage, { channel, guild, presenceCount, memberCount }: Invite, authorModel: UserModel): MessageEmbed
	{
		const iconURL: string | null = guild!.iconURL();

		const createdAt: moment.Moment = moment(guild!.createdAt);

		return MessageEmbed.common(message, authorModel)
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
	}
}

export { LookupCommand as Command };
