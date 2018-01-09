import { GuildChannel, Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class NotifCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['notif', 'notifchannel', 'notif_channel'],
			coins: 0,
			description: 'Gets or sets a custom channel for welcome and farewell messages.',
			examples: [
				'notif',
				'notif #general',
				'notif false // to remove the channel',
			],
			exp: 0,
			name: 'notif-channel',
			permLevel: PermLevels.HUMANTAMER,
			usage: 'notif [Channel]',
		});
	}

	public async run(message: Message, [target]: string[]): Promise<Message | Message[]> {
		// Nothing passed, show current
		if (!target) {
			const alreadyChannel: GuildChannel = message.guild.channels.get(message.guild.model.notificationChannelId);
			if (alreadyChannel) {
				return message.reply(`the current channel for welcome and farewell messages is ${alreadyChannel}.`);
			}
			if (message.guild.model.notificationChannelId) {
				message.guild.model.notificationChannelId = undefined;
				await message.guild.model.save();
			}

			return message.reply('there is no channel for welcome and farewell messages set up.');
		}

		// "false" passed, remove
		if (target.toLowerCase() === 'false') {
			if (message.guild.model.notificationChannelId) {
				message.guild.model.notificationChannelId = undefined;
				await message.guild.model.save();

				return message.reply('the channel for welcome and farewell messages has been removed from the config.');
			}

			return message.reply('there is no channel for welcome and farewell messages set up.');
		}

		// Something was passed, try to set a new one
		let channel: GuildChannel;
		// This will go to resolve channel for CommandHandler if somewhere else required
		const match: RegExpExecArray = /^<#(\d{17,19})>$|^(\d{17,19})$/.exec(target);
		if (match) {
			const which: string = match[1] || match[2];
			channel = message.guild.channels.get(which);
		}

		target = target.toLowerCase();
		// You never know
		if (target[0] === '#') target = target.slice(1);
		if (!channel) {
			channel = message.guild.channels.find(
				(c: GuildChannel) => c.type === 'text' && c.name.toLowerCase() === target,
			);
		}

		if (!channel) return message.reply(`I could not find a channel with **${target}**.`);

		// Be sure that we can send messages to the specified channel
		if (!channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
			return message.reply(`I do not have permissions to send messages in ${channel}.`);
		}

		message.guild.model.notificationChannelId = channel.id;
		await message.guild.model.save();

		return message.reply(`you set ${channel} as channel for welcome and farewell messages.`);
	}
}

export { NotifCommand as Command };
