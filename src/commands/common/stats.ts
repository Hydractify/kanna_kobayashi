import { Client, Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Emojis } from '../../types/Emojis';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IShardData } from '../../types/IShardData';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { version } = require('../../../package');

class StatsCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['kannastats', 'bstats'],
			cooldown: 0,
			description: 'Stats about the bot',
			examples: ['stats'],
			exp: 0,
			usage: 'stats',
		});
	}

	public async run(
		message: GuildMessage,
		args: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		const data: IShardData[] = await this.client.shard!.broadcastEval<IShardData>(
			(client: Client) => ({
				guilds: client.guilds.cache.size,
				ids: client.shard!.ids,
				ram: process.memoryUsage().heapUsed / 1024 / 1024,
				users: client.users.cache.size,
			}),
		);

		let totalGuilds: number = 0;
		let totalUsers: number = 0;
		let totalRam: number = 0;
		for (const { guilds, users, ram, ids } of data)
		{
			if (ids.includes(message.guild.shardID))
			{
				ids[ids.length - 1] = `${ids[ids.length - 1]}*`;
			}
			totalGuilds += guilds;
			totalUsers += users;
			totalRam += ram;
		}

		const shardsInfo = this._buildTableString(data);

		const uptime: string = [
			moment.duration(this.client.uptime!).format('d[ Days], hh:mm:ss'),
			`[${moment.duration(this.client.uptime!).humanize()}]`,
		].join(' ');

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`${this.client.user!.username}'s Stats (v${version})`, this.client.user!.displayAvatarURL())
			.setDescription('\u200b')
			.setThumbnail(message.guild.iconURL())
			.addField(`Uptime ${Emojis.KannaHug}`, uptime, true)
			.addField(`Total Servers ${Emojis.KannaWow}`, totalGuilds.toLocaleString(), true)
			.addField(`Total Users ${Emojis.KannaLolice}`, totalUsers.toLocaleString(), true)
			.addField(`Total Ram Used ${Emojis.KannaTired}`, `${totalRam.toFixed(2)} MB`, true)
			.addField(`Shards ${Emojis.KannaHungry}`, shardsInfo);

		return message.channel.send(embed);
	}

	private _buildTableString(data: IShardData[]): string
	{
		// 'IDs'.length
		let longestId: number = 3;
		// 'Guilds'.length
		let longestGuild: number = 6;
		// 'Ram'.length
		let longestRam: number = 8;
		// 'Users'.length
		let longestUser: number = 5;

		for (const { guilds, ids, ram, users } of data)
		{
			let tmp: number;

			tmp = ids.map(id => id.toLocaleString()).join(', ').length;
			if (tmp > longestId) longestId = tmp;

			tmp = guilds.toLocaleString().length;
			if (tmp > longestGuild) longestGuild = tmp;

			tmp = ram.toFixed(2).length + 3;
			if (tmp > longestRam) longestRam = tmp;

			tmp = users.toLocaleString().length;
			if (tmp > longestUser) longestUser = tmp;
		}

		// Add the extra space to the right and left
		longestId += 2;
		longestGuild += 2;
		longestUser += 2;
		longestRam += 2;

		let shardInfo: string = [
			'```xl\n',
			'╔', '═'.repeat(longestId),
			'╤', '═'.repeat(longestRam),
			'╤', '═'.repeat(longestGuild),
			'╤', '═'.repeat(longestUser),
			'╗\n',
		].join('');

		shardInfo += [
			'║', this._pad('IDs', longestId),
			'|', this._pad('Ram Used', longestRam),
			'|', this._pad('Guilds', longestGuild),
			'|', this._pad('Users', longestUser),
			'║\n',
		].join('');

		for (const { guilds, ids, ram, users } of data)
		{
			shardInfo += [
				'║', this._pad(ids.map(id => id.toLocaleString()).join(', '), longestId),
				'|', this._pad(`${ram.toFixed(2)} MB`, longestRam),
				'|', this._pad(guilds.toLocaleString(), longestGuild),
				'|', this._pad(users.toLocaleString(), longestUser),
				'║\n',
			].join('');
		}
		shardInfo += [
			'╚', '═'.repeat(longestId),
			'╧', '═'.repeat(longestRam),
			'╧', '═'.repeat(longestGuild),
			'╧', '═'.repeat(longestUser),
			'╝\n',
			'```',
		].join('');

		return shardInfo;
	}

	private _pad(value: string, length: number): string
	{
		if (value.length >= length) return value;
		length -= value.length;

		return `${' '.repeat(length / 2)}${value}${' '.repeat(length / 2 + (length % 2))}`;
	}
}

export { StatsCommand as Command };
