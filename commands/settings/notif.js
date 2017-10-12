const Command = require('../../structures/Command');

class NotifCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['notif', 'notifchannel', 'notif_channel'],
			coins: 0,
			description: 'Gets or sets a custom channel for welcome and farewell messages.',
			examples: [
				'notif',
				'notif #general',
				'notif false // to remove the channel'
			],
			exp: 0,
			name: 'notif-channel',
			usage: 'notif [channel]',
			permLevel: 2
		});
	}

	async run(message, [target]) {
		// Nothing passed, show current
		if (!target) {
			const channel = message.guild.channels.get(message.guild.model.notificationChannelId);
			if (channel) {
				return message.reply(`the current channel for welcome and farewell messages is ${channel}.`);
			}
			if (message.guild.model.notificationChannelId) {
				message.guild.model.notificationChannelId = null;
				await message.guild.model.save();
			}

			return message.reply('there is no channel for welcome and farewell messages set up.');
		}

		// "false" passed, remove
		if (target.toLowerCase() === 'false') {
			if (message.guild.model.notificationChannelId) {
				message.guild.model.notificationChannelId = null;
				await message.guild.model.save();

				return message.reply('the channel for welcome and farewell messages has been removed from the config.');
			}

			return message.reply('there is no channel for welcome and farewell messages set up.');
		}

		// Something was passed, try to set a new one
		let channel;
		// This will go to resolve channel for CommandHandler if somewhere else required
		let match = /^<#(\d{17,19})>$|^(\d{17,19})$/.exec(target);
		if (match) {
			const which = match[1] || match[2];
			channel = message.guild.channels.get(which);
		}

		target = target.toLowerCase();
		// You never know
		if (target[0] === '#') target = target.slice(1);
		if (!channel) {
			channel = message.guild.channels.find(cha => cha.type === 'text'
				&& cha.name.toLowerCase() === target);
		}

		if (!channel) return message.reply(`I could not find a channel with **${target}**.`);

		// Be sure that we can send messages to the specified channel
		if (!channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
			return message.reply(`I do not have permissions to send messages in ${channel}.`);
		}

		message.guild.model.notificationChannelId = channel.id;
		await message.guild.model.save();

		return message.reply(`the new channel for welcome and farewell messages is now ${channel}.`);
	}
}

module.exports = NotifCommand;
