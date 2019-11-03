import { Message } from 'discord.js';
import { col, fn, Op } from 'sequelize';

import { CommandLog } from '../../models/CommandLog';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { titleCase } from '../../util/Util';

class CommandUsageCommand extends Command 
{
	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			aliases: ['usage'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Stats about command usages',
			examples: ['usage'],
			exp: 0,
			usage: 'usage',
		});
	}

	public async run(message: GuildMessage, _: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> 
	{
		const [thisMonth, lastHour]: [CommandLog[], CommandLog[]] = await Promise.all([
			CommandLog.findAll({
				attributes: [[fn('COUNT', col('command_name')), 'count'], ['command_name', 'commandName']],
				group: ['commandName'],
				order: [['count', 'DESC']],
			}),
			CommandLog.findAll({
				attributes: [[fn('COUNT', col('command_name')), 'count'], ['command_name', 'commandName']],
				group: ['commandName'],
				order: [['count', 'DESC']],
				where: { run: { [Op.gt]: Date.now() - 35e5 } },
			}),
		]);

		let allTimeCount: number = 0;
		const thisMonthTop5: string[] = [];
		for (let { dataValues: { count, commandName } } of thisMonth as any) 
		{
			count = Number(count);
			allTimeCount += count;
			if (thisMonthTop5.length <= 5) 
			{
				thisMonthTop5.push(
					`${thisMonthTop5.length + 1}. ${titleCase(commandName.replace(/([A-Z])/g, ' $1'))}: ${count.toLocaleString()}`,
				);
			}
		}

		let lastHourCount: number = 0;
		const lastHourTop5: string[] = [];
		for (let { dataValues: { count, commandName } } of lastHour as any) 
		{
			count = Number(count);
			lastHourCount += count;
			if (lastHourTop5.length <= 5) 
			{
				lastHourTop5.push(
					`${lastHourTop5.length + 1}. ${titleCase(commandName.replace(/([A-Z])/g, ' $1'))}: ${count.toLocaleString()}`,
				);
			}
		}

		thisMonthTop5.unshift(
			`Count: ${allTimeCount.toLocaleString()}`,
			'\u200b',
		);

		lastHourTop5.unshift(
			`Count: ${lastHourCount.toLocaleString()}`,
			'\u200b',
		);

		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setThumbnail(message.guild.iconURL())
			.setTitle('Command Usage Statistics')
			.addField('This Month', thisMonthTop5, true)
			.addField('Last Hour', lastHourTop5, true);

		return message.reply(embed);
	}
}

export { CommandUsageCommand as Command };
