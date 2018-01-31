import { Message } from 'discord.js';
import * as moment from 'moment';
import { QueryTypes } from 'sequelize';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { titleCase } from '../../util/Util';

class CommandUsageCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['commandStats', 'usage'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Displays stats about command usage',
			examples: ['commandUsage'],
			exp: 0,
			name: 'commandUsage',
			usage: 'commandUsage',
		});
	}

	public async run(message: Message, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const entries: {
			name: string;
			total: number;
			allTime: number;
			recent: number;
			lastHour: number;
		}[] = await this.sequelize.query(`
		SELECT
			DISTINCT "command_logs"."command_name" as "name",
			"total"."usages" AS "total",
			"total"."all_time" AS "allTime",
			"recent"."usages" AS "recent",
			"recent"."last_hour" AS "lastHour"
		FROM "command_logs"
		LEFT JOIN (
			SELECT
				"command_logs"."command_name",
				COUNT(*) AS "usages",
				(SELECT count(*) FROM "command_logs") AS "all_time"
			FROM "command_logs"
			GROUP BY "command_logs"."command_name"
			ORDER BY "usages" DESC
			LIMIT 5
		) "total" ON "total"."command_name" = "command_logs"."command_name"
		LEFT JOIN (
			SELECT
				"command_logs"."command_name",
				(SELECT count(*) FROM "command_logs" WHERE "command_logs"."run">=:lastHour) AS "last_hour",
				COUNT(*) AS "usages"
			FROM "command_logs"
			WHERE "command_logs"."run">=:lastHour
			GROUP BY "command_logs"."command_name"
			ORDER BY "usages" DESC
			LIMIT 5
		) "recent" ON "recent"."command_name" = "command_logs"."command_name"
		WHERE "total"."usages" NOTNULL OR "recent"."usages" NOTNULL
		ORDER BY "total" DESC;`,
			{
				replacements: {
					lastHour: moment().add(-1, 'hours').format('YYYY-MM-DD HH:mm:ss.SSS Z'),
				},
				type: QueryTypes.SELECT,
			});

		interface IEntry { count: number; name: string; }
		let allTimeCount: number = 0;
		let lastHourCount: number = 0;
		const allTimeTop5: IEntry[] = [];
		const lastHourTop5: IEntry[] = [];

		for (const entry of entries) {
			if (entry.allTime) allTimeCount = entry.allTime;
			if (entry.lastHour) lastHourCount = entry.lastHour;
			if (entry.recent) {
				lastHourTop5.push({
					count: entry.recent,
					name: titleCase(entry.name.replace(/([A-Z])/g, ' $1')),
				});
			}
			if (entry.total) {
				allTimeTop5.push({
					count: entry.total,
					name: titleCase(entry.name.replace(/([A-Z])/g, ' $1')),
				});
			}
		}
		lastHourTop5.sort((a: IEntry, b: IEntry) => b.count - a.count);

		const allTimeMapped: string[] = allTimeTop5
			.map((entry: IEntry, i: number) => `${i + 1}. ${entry.name}: ${entry.count.toLocaleString()}`);

		allTimeMapped.unshift(
			`Count: ${allTimeCount.toLocaleString()}`,
			'\u200b',
		);

		const lastHourMapped: string[] = lastHourTop5
			.map((entry: IEntry, i: number) => `${i + 1}. ${entry.name}: ${entry.count.toLocaleString()}`);

		lastHourMapped.unshift(
			`Count: ${lastHourCount.toLocaleString()}`,
			'\u200b',
		);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setThumbnail(message.guild.iconURL())
			.setTitle('Command Usage Statistics')
			.addField('All Time', allTimeMapped, true)
			.addField('Last Hour', lastHourMapped, true);

		return message.channel.send(embed);
	}
}

export { CommandUsageCommand as Command };
