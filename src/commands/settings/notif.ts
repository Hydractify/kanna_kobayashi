import { GuildChannel, Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';

class NotifChannelCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['notif-channel', 'notif', 'notif_channel'],
			description: 'Get or set a custom channel for welcome and farewell messages',
			examples: [
				'notif',
				'notif #general',
				'notif remove // to remove the channel',
			],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.HUMANTAMER,
			usage: 'notif [Channel]',
		});
	}

	public async run(message: GuildMessage, [target]: string[]): Promise<Message | Message[]>
	{
		// Nothing passed, show current
		if (!target)
		{
			const alreadyChannel: GuildChannel | undefined = message.guild.model.notificationChannelId
				? message.guild.channels.get(message.guild.model.notificationChannelId)
				: undefined;
			if (alreadyChannel)
			{
				return message.reply(`the current channel for welcome and farewell messages is ${alreadyChannel}.`);
			}
			if (message.guild.model.notificationChannelId)
			{
				message.guild.model.notificationChannelId = null;
				await message.guild.model.save();
			}

			return message.reply('there is no channel for welcome and farewell messages set up.');
		}

		// "remove" passed, remove
		if (target.toLowerCase() === 'remove')
		{
			if (message.guild.model.notificationChannelId)
			{
				message.guild.model.notificationChannelId = null;
				await message.guild.model.save();

				return message.reply('the channel for welcome and farewell messages has been removed from the config.');
			}

			return message.reply('there is no channel for welcome and farewell messages set up.');
		}

		// Something was passed, try to set a new one
		let channel: GuildChannel | undefined;
		// This will go to resolve channel for CommandHandler if somewhere else required
		const match: RegExpExecArray | null = /^<#(\d{17,19})>$|^(\d{17,19})$/.exec(target);
		if (match)
		{
			const which: string = match[1] || match[2];
			channel = message.guild.channels.get(which);
		}

		target = target.toLowerCase();
		// You never know
		if (target[0] === '#') target = target.slice(1);
		if (!channel)
		{
			channel = message.guild.channels.find(
				(c: GuildChannel) => c.type === 'text' && c.name.toLowerCase() === target,
			);
		}

		if (!channel) return message.reply(`I could not find a channel with **${target}**.`);

		// Be sure that we can send messages to the specified channel
		if (!(channel.permissionsFor(this.client.user!)?.has('SEND_MESSAGES') ?? false))
		{
			return message.reply(`I do not have permissions to send messages in ${channel}.`);
		}

		message.guild.model.notificationChannelId = channel.id;
		await message.guild.model.save();

		return message.reply(`you set ${channel} as channel for welcome and farewell messages.`);
	}
}

export { NotifChannelCommand as Command };
