import { Client, Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IShardData } from '../../types/IShardData';

const { version } = require('../../../package');

class StatsCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['kannastats', 'bstats'],
			cooldown: 0,
			description: 'Stats about the bot',
			examples: ['stats'],
			exp: 0,
			usage: 'stats',
		});
	}

	public async run(message: Message, args: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const data: IShardData[] = await this.client.shard.broadcastEval<IShardData>(
			(client: Client) => ({
				guilds: client.guilds.size,
				id: client.shard.id,
				ram: process.memoryUsage().heapUsed / 1024 / 1024,
				users: client.users.size,
			}),
		);

		let totalGuilds: number = 0;
		let totalUsers: number = 0;
		let totalRam: number = 0;
		for (const { guilds, users, ram } of data) {
			totalGuilds += guilds;
			totalUsers += users;
			totalRam += ram;
		}

		const shardsInfo = this._buildTableString(data);

		const uptime: string = [
			moment.duration(this.client.uptime).format('d[ Days], hh:mm:ss'),
			`[${moment.duration(this.client.uptime).humanize()}]`,
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

	private _buildTableString(data: IShardData[]): string {
		// 'ID'.length
		let longestId: number = 2;
		// 'Guilds'.length
		let longestGuild: number = 6;
		// 'Ram'.length
		let longestRam: number = 8;
		// 'Users'.length
		let longestUser: number = 5;

		for (const { guilds, id, ram, users } of data) {
			if (id.toLocaleString().length > longestId) longestId = id.toLocaleString().length;
			if (guilds.toLocaleString().length > longestGuild) longestGuild = guilds.toLocaleString().length;
			if (((ram.toFixed(2).length) + 3) > longestRam) longestRam = ram.toFixed(2).length + 3;
			if (users.toLocaleString().length > longestUser) longestUser = users.toLocaleString().length;
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
			'║', this._pad('ID', longestId),
			'|', this._pad('Ram Used', longestRam),
			'|', this._pad('Guilds', longestGuild),
			'|', this._pad('Users', longestUser),
			'║\n',
		].join('');

		for (const { guilds, id, ram, users } of data) {
			shardInfo += [
				'║', this._pad(id.toLocaleString(), longestId),
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

	private _pad(value: string, length: number): string {
		if (value.length >= length) return value;
		length -= value.length;

		return `${' '.repeat(length / 2)}${value}${' '.repeat(length / 2 + (length % 2))}`;
	}
}

export { StatsCommand as Command };
