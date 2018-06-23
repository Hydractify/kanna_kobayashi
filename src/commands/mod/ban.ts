import { Collection, GuildMember, Message, Snowflake } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';
import { FlagCollection, flagsText, parseFlags } from '../../util/Util';

class BanCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['banne', 'exile'],
			clientPermissions: ['BAN_MEMBERS'],
			coins: 0,
			description: 'Ban a member... Or a lot of them!',
			examples: ['ban wizard', 'ban wizard anxeal space'],
			exp: 0,
			name: 'ban',
			permLevel: PermLevels.HUMANTAMER,
			usage: 'ban <...Member> [\'--reason\' reason & \'--days\' deletedays]',
		});
	}

	public parseArgs(message: Message, args: string[]): string | [FlagCollection] {
		if (!args.length) return 'you must provide me with at least one member to ban!';
		const flags: FlagCollection = parseFlags(args.join(' '), true);

		const days: number = parseInt(flags.get('days') as string || '0');
		if (isNaN(days)) return 'specified days is not a number';
		if (days < 0 || days > 7) {
			return 'specified days are out range, it is only possible to delete messages of the last 0-7 days!';
		}

		return [flags];
	}

	public async run(message: Message, [flags]: [FlagCollection]): Promise<Message | Message[]> {
		const members: Set<GuildMember> = new Set();
		const failed: Set<GuildMember> = new Set();
		const fetchPromises: Promise<void>[] = [];
		for (const target of (flags.get(flagsText) as string).split(' ')) {
			const promise: Promise<void> = this.resolver.resolveMember(target, message.guild)
				.then(async (member: GuildMember) => {
					if (!member) return;
					const model: UserModel = await member.user.fetchModel();
					if (member.bannable && model.permLevel(member) < 2) {
						members.add(member);
					} else {
						failed.add(member);
					}
				});

			fetchPromises.push(promise);
		}
		await Promise.all(fetchPromises);

		if (failed.size) return message.reply(`I am not able to ban **${[...failed].join('**, **')}**!`);

		message.reply(`are you sure you want to ban ${[...members].join(' ')}? (**Y**es or **N**o)`);

		const answer: Message = await message.channel.awaitMessages(
			(msg: Message) => message.author.id === msg.author.id && /^(y|n|yes|no)/i.test(msg.content),
			{ time: 6e4, max: 1 },
		).then((collected: Collection<Snowflake, Message>) => collected.first());

		if (!answer) {
			return message.reply(
				'since you did not answer my question, I had to cancel the ban. <:kannaShy:458779242696540170>',
			);
		}

		if (/^(y|yes)/i.test(answer.content)) {
			const days: number = parseInt(flags.get('days') as string || '1');
			const reason: string =
				`Banned by ${message.author.tag} with the reason: ${flags.get('reason') || 'No reason provided'}`;
			const banPromises: Promise<GuildMember>[] = [];
			for (const member of members.values()) {
				banPromises.push(
					member.ban({
						days,
						reason,
					}),
				);
			}
			await Promise.all(banPromises);

			return message.reply(
				`I successfully banned **${[...members].map((member: GuildMember) => member.user.tag).join('**, **')}**!`,
			);
		}

		return message.channel.send('Ok, canceling the ban! <:kannaShy:458779242696540170>');
	}
}

export { BanCommand as Command };
