const Command = require('../../structures/Command');

class OptionsCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: [
				'option',
				'setting',
				'settings'
			],
			coins: 0,
			description: 'Modify server settings',
			examples: [
				'settings prefix "kamui "',
				'settings welcome #general',
				'settings welcome false',
				'settings levelup true',
				'settings levelup false'
			],
			exp: 0,
			name: 'options',
			usage: 'settings <prefix|welcome|levelup> [channel|\'true\'|\'false\'|...prefix]',
			permLevel: 2
		});
	}

	run(message, [option, ...args]) {
		if (!option) return message.channel.send('You have to tell me what option you want to see or modify.');

		option = option.toLowerCase();
		if (!['prefix', 'welcome', 'levelup'].includes(option)) {
			return message.channel.send('Unknown option, valid options are `prefix`, `welcome` and `levelup`.');
		}

		return this[option](message, args);
	}

	async levelup(message, [state]) {
		state = state.toLowerCase();
		if (!state || !['true', 'false'].includes(state)) {
			return message.channel.send(
				`Level up messages are currently ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}.`
			);
		}

		if ((state === 'true') === message.guild.model.levelUpEnabled) {
			return message.channel.send(
				`Level up message are already ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}`
			);
		}

		// No eval for type coercion, never 🔪
		message.guild.model.levelUpEnabled = state === 'true';
		await message.guild.model.save();

		return message.channel.send(
			`Level up message in this guild are now ${message.guild.model.levelUpEnabled ? 'enabled' : 'disabled'}`
		);
	}

	async prefix(message, args) {
		if (!args.length) {
			const prefixes = `Always working prefixes are: \`@${this.client.user.tag} \u200b\`, \`k!\` and \`kanna \u200b\``;
			if (!message.guild.model.prefixes.length) {
				return message.channel.send(prefixes);
			}

			return message.channel.send(
				`${prefixes}\nAdditionally in this guild added: \`${message.guild.model.prefixes[0]}\u200b\``
			);
		}

		let newPrefix = args.join(' ');
		if (newPrefix[0] === '"' && newPrefix[newPrefix.length - 1] === '"') {
			newPrefix = newPrefix.slice(1, -1);
		}

		message.guild.model.prefixes[0] = newPrefix;
		await message.guild.model.save();

		return message.channel.send(`Set the guild specific prefix to \`${newPrefix}\u200b\``);
	}

	async welcome(message, [target]) {
		// Nothing passed, show current
		if (!target) {
			const channel = message.guild.channels.get(message.guild.model.notificationChannelId);
			if (channel) {
				return message.channel.send(`The current channel for welcome and farewell messages is ${channel}.`);
			} else if (message.guild.model.notificationChannelId) {
				message.guild.model.notificationChannelId = null;
				await message.guild.model.save();
			}

			return message.channel.send('There is no channel for welcome and farewell messages set up.');
		}

		// "false" passed, remove
		if (target.toLowerCase() === 'false') {
			if (message.guild.model.notificationChannelId) {
				message.guild.model.notificationChannelId = null;
				await message.guild.model.save();

				return message.channel.send('The channel for welcome and farewell messages has been removed from the config.');
			}

			return message.channel.send('There is no channel for welcome and farewell messages set up.');
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

		if (!channel) return message.channel.send(`Couldn't find a channel with ${channel}.`);

		// Be sure that we can send messages to the specified channel
		if (!channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
			return message.channel.send(`I don't have permissions to send messages in ${channel}.`);
		}

		message.guild.model.notificationChannelId = channel.id;
		await message.guild.model.save();

		return message.channel.send(`The new channel for welcome and farewell messages is now ${channel}.`);
	}
}

module.exports = OptionsCommand;
