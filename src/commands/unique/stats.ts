import { Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IShardData, IShardDataOther } from '../../types/IShardData';

const { version } = require('../../../package');

class StatsCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['kannastats', 'bstats'],
			coins: 0,
			cooldown: 0,
			description: 'Shows stats about the bot.',
			examples: ['stats'],
			exp: 0,
			name: 'stats',
			usage: 'stats',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const { guilds, users, other } = await
			this.client.shard.broadcastEval([
				'({',
				'guilds: this.guilds.size,',
				'users: this.users.size,',
				'other: {',
				// tslint:disable-next-line:no-invalid-template-strings
				'ram: `${(process.memoryUsage().heapUsed / 1024 / 1204).toFixed(2)} MB`,',
				'shardId: this.shard.id',
				'}',
				'})',
			].join('')).then((res: IShardData[]) =>
				res.reduce(
					(previous: IShardData<IShardDataOther[]>, current: IShardData) => {
						previous.guilds += current.guilds;
						previous.users += current.users;
						previous.other.push(current.other);

						return previous;
					},
					{ guilds: 0, users: 0, other: [] },
				));

		other.sort((a: IShardDataOther, b: IShardDataOther) => a.shardId - b.shardId);

		const uptime: string = [
			moment.duration(this.client.uptime).format('d[ Days], hh[h]:mm[m]:ss[s]'),
			`[${moment.duration(this.client.uptime).humanize()}]`,
		].join(' ');
		const ram: string[] = other.map((shard: IShardDataOther) => `Shard ${shard.shardId + 1}: ${shard.ram}`);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${this.client.user.username}'s stats`, this.client.user.displayAvatarURL())
			.setDescription('\u200b')
			.setThumbnail(message.guild.iconURL())
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

export { StatsCommand as Command };
