import { Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

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
		const totalGuilds: number = this.client.guilds.size;
		const totalUsers: number = this.client.users.size;
		const totalRam: number = process.memoryUsage().heapUsed / 1024 / 1024;

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
			.addField(`Total Ram Used ${Emojis.KannaTired}`, `${totalRam.toFixed(2)} MB`, true);

		return message.channel.send(embed);
	}

}

export { StatsCommand as Command };
