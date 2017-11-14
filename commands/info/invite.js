const { Guild, SnowflakeUtil } = require('discord.js');
const moment = require('moment');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

const { get: guildIconURL } = Object.getOwnPropertyDescriptor(Guild.prototype, 'iconURL');

class LookupCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['ii', 'lookup'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Looks up guild\'s info by an invite link or invite code.',
			examples: [
				'lookup uBdXdE9',
				'lookup discord.gg/uBdXdE9'
			],
			exp: 0,
			usage: 'lookup <invite>',
			name: 'lookup'
		});
	}

	async run(message, [code], { authorModel }) {
		if (!code) return message.reply('you have to give me an invite link or code!');
		const { guild, channel, memberCount, presenceCount } = await this.client.fetchInvite(code).catch(() => null) || {};
		if (!guild) return message.reply('I couldn\'t find a valid invite for this link or code.');

		// This shard is part of that guild, give full info
		if (guild instanceof Guild) {
			return this.handler.commands.get('guildinfo').run(message, undefined, { authorModel });
		}

		const iconURL = guildIconURL.call(guild);

		const createdAt = moment(SnowflakeUtil.deconstruct(guild.id).timestamp);

		const embed = RichEmbed.common(message, authorModel)
			.setTitle(`Info about ${guild.name}`)
			.setThumbnail(iconURL)

			.addField(
				'Guild ID',
				guild.id
			)

			.addField(
				'Guild creation',
				createdAt.utc().format('MM/DD/YYYY [(]HH:mm[)]'),
				true
			)

			.addField(
				'Channel of the invite',
				[
					`• Name: \`${channel.name}\``,
					`• Mention: <#${channel.id}>\n_Note: This mentions only resolves when you are part of this guild._`
				],
				true
			)

			.addField(
				'Members',
				[
					`• Online: \`${presenceCount.toLocaleString()}\``,
					`• Total: \`${memberCount.toLocaleString()}\``
				],
				true
			);

		return message.channel.send(embed);
	}
}

module.exports = LookupCommand;
