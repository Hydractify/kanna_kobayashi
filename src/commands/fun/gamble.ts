import { Message } from 'discord.js';
import { RedisClient } from 'redis-p';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { Redis } from '../../util/RedisDecorator';

@Redis
class GambleCommand extends Command {
	private readonly redis: RedisClient;

	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			description: 'Gamble your coins to get more!',
			examples: ['gamble 10000'],
			exp: 0,
			name: 'gamble',
			usage: 'gamble <Amount>',
		});
	}

	public parseArgs(
		message: Message,
		[input]: string[],
		{ authorModel }: ICommandRunInfo,
	): string | [number] {
		if (!input) return `you must give me an amount! (\`${this.usage}\`)`;

		const amount: number = parseInt(input);
		if (!amount) return `**${input}** is not a valid number or zero!`;

		if (amount > authorModel.coins) return `you do not own **${amount}** coins!`;

		return [amount];
	}

	public async run(
		message: Message,
		[amount]: [number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		let chance: number = Math.floor((Math.random() * 100));
		if (authorModel.tier) chance = chance * authorModel.tier;

		let boost: number = 0;
		if (chance === 100) boost = 5;
		else if (chance >= 80) boost = 2;
		else if (chance >= 60) boost = 1;

		let reply: string;
		if (!boost) {
			amount = -amount;
			reply = `you lost **${amount}** coins! <:KannaAyy:315270615844126720>`;
		} else {
			amount = amount * boost;
			reply = `you got **${amount}** coins! <:KannaWtf:320406412133924864>`;
		}

		await authorModel.increment({ coins: amount });

		await this.redis
		.multi()
		.hincrby(`users:${message.author.id}`, 'coins', amount)
		.exec();

		return message.reply(reply);
	}
}

export { GambleCommand as Command };
