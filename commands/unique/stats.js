const moment = require('moment');
require('moment-duration-format');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

const { version } = require('../../package');

class StatsCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['kannastats', 'bstats'],
			coins: 0,
			cooldown: 0,
			description: 'Shows stats about the bot.',
			examples: ['stats'],
			exp: 0,
			name: 'stats',
			usage: 'stats',
			permLevel: 0
		});
	}

	async run(message) {
		const { guilds, users, other } = await
			this.client.shard.broadcastEval([
				'({',
				'guilds: this.guilds.size,',
				'users: this.users.size,',
				'other: {',
				// eslint-disable-next-line no-template-curly-in-string
				'ram: `${(process.memoryUsage().heapUsed / 1024 / 1204).toFixed(2)} MB`,',
				'shardId: this.shard.id',
				'}',
				'})'
			].join('')).then(res =>
				res.reduce((previous, current) => {
					previous.guilds += current.guilds;
					previous.users += current.users;
					previous.other.push(current.other);
					return previous;
				}, { guilds: 0, users: 0, other: [] })
			);
		other.sort((a, b) => a.shardId - b.shardId);

		const uptime = [
			moment.duration(this.client.uptime).format('d[ Days], hh[h]:mm[m]:ss[s]'),
			`[${moment.duration(this.client.uptime).humanize()}]`
		].join(' ');
		const ram = other.map(shard => `Shard ${shard.shardId + 1}: ${shard.ram}`);

		const embed = RichEmbed.common(message, await message.author.fetchModel())
			.setAuthor(`${this.client.user.username}'s stats`, this.client.user.displayAvatarURL)
			.setDescription('\u200b')
			.setThumbnail(message.guild.iconURL)
			.addField('Uptime <:hugme:299650645001240578>', uptime, true)
			.addField('Guilds <:oh:315264555859181568>', guilds, true)
			// Technically bots as well
			.addField('Humans <:police:331923995278442497>', users, true)
			.addField('Version <:isee:315264557843218432>', version, true)
			.addField('Shards <:hmm:315264556282675200>', this.client.shard.count, true)
			.addField('RAM used <:tired:315264554600890390>', ram, true);

		return message.channel.send(embed);
	}
}

module.exports = StatsCommand;
