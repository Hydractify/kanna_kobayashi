import { Collection, GuildMember, Message, Snowflake } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';
import { FlagCollection, flagsText, parseFlags } from '../../util/Util';

class KickCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			clientPermissions: ['KICK_MEMBERS'],
			coins: 0,
			description: 'Kick a member... Or a lot of them!',
			examples: ['kick wizard', 'kick wizard anxeal space'],
			exp: 0,
			name: 'kick',
			permLevel: PermLevels.HUMANTAMER,
			usage: 'kick <...Member> [\'--reason\' reason]',
		});
	}

	public parseArgs(message: Message, args: string[]): string | [FlagCollection] {
		if (!args.length) return 'you must provide me with at least one member to ban!';

		return [parseFlags(args.join(' '))];
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
					if (member.kickable && model.permLevel(member) < 2) {
						members.add(member);
					} else {
						failed.add(member);
					}
				});

			fetchPromises.push(promise);
		}
		await Promise.all(fetchPromises);

		if (failed.size) return message.reply(`I am not able to kick **${[...failed].join('**, **')}**!`);

		message.reply(`are you sure you want to kick ${[...members].join(' ')}? (**Y**es or **N**o)`);

		const answer: Message = await message.channel.awaitMessages(
			(msg: Message) => /^(y|n|yes|no)/i.test(msg.content),
			{ time: 6e4, max: 1 },
		).then((collected: Collection<Snowflake, Message>) => collected.first());

		if (!answer) {
			return message.reply(
				'since you did not answer my question, I had to cancel the kick. <:KannaAyy:315270615844126720>',
			);
		}

		if (/^(y|yes)/i.test(answer.content)) {
			const reason: string = flags.get('reason') as string;
			const banPromises: Promise<GuildMember>[] = [];
			for (const member of members.values()) {
				banPromises.push(member.kick(reason));
			}
			await Promise.all(banPromises);

			return message.reply(`I successfully banned ${[...members].join(' ')}!`);
		}

		return message.channel.send('Ok, canceling the ban! <:KannaAyy:315270615844126720>');
	}
}

export { KickCommand as Command };
