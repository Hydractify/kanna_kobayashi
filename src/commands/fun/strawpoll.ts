import { Collection, Message, Snowflake } from 'discord.js';
import { get, post, Result } from 'snekfetch';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IStrawPollPoll } from '../../types/IStrawPollPoll';

class StrawPollCommand extends Command {
	private apiURL: string;
	private baseURL: string;

	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['poll'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Create or display a strawpoll',
			examples: ['strawpoll 1', 'strawpoll'],
			exp: 0,
			name: 'strawpoll',
			usage: 'strawpoll [ID]',
		});

		this.baseURL = 'http://www.strawpoll.me';
		this.apiURL = `${this.baseURL}/api/v2/polls`;
	}

	public async run(message: Message, [id]: string[], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		if (id) {
			const { body: fetchedPoll }: Result<IStrawPollPoll> = await get(`${this.apiURL}/${id}`)
				.set('Content-Type', 'application/json')
				.catch(() => ({ body: undefined }));
			// 404 and json is overrated, better respond with 200 and html
			if (!fetchedPoll || fetchedPoll instanceof Buffer) {
				return message.reply('I could not find a strawpoll with that ID.');
			}

			return this.showPoll(message, fetchedPoll, authorModel);
		}

		const data: string[] = [];
		for (const question of this.questions()) {
			const promptMessage: Message = await message.reply(question) as Message;

			const response: Message = await message.channel
				.awaitMessages((msg: Message) => msg.author.id === message.author.id, { max: 1, time: 30 * 1000 })
				.then((collected: Collection<Snowflake, Message>) => collected.first());

			// No answer, aborting
			if (!response) {
				return message.reply('aborting then.');
			}

			if (response.content.toLowerCase().startsWith('end')) {
				// We already have 4 elements, continuing just fine
				if (data.length > 3) break;

				// We do not, abort
				return message.reply('aborting then.');
			}

			// Clean up if we have permissions
			if (response.deletable) {
				await Promise.all([
					response.delete(),
					promptMessage.delete(),
				]).catch(() => undefined);
			}

			data.push(response.content);
		}

		const [title, multi, ...options] = data;

		const { body: poll }: Result<IStrawPollPoll> = await post(this.apiURL)
			.set('Content-Type', 'application/json')
			.set('Accept', 'application/json')
			.send({
				multi: multi[0].toLowerCase() === 'y',
				options,
				title,
			});

		return this.showPoll(message, poll, authorModel);
	}

	private * questions(): IterableIterator<string> {
		yield 'what should the name of the poll be?';
		yield 'should voters be allowed to vote for more than one option? (`y`/anything)';
		// 1
		yield 'what options do you want the voters to have? (Enter one at a time, you need at least two more)';
		// 2
		yield 'what options do you want the voters to have? (Enter one at a time, you need at least one more)';

		// 3 - 29
		for (let i: number = 0; i < 27; ++i) {
			yield 'what options do you want the voters to have? (Enter one at a time, or `end` to tell me you are done)';
		}

		// 30
		return 'what options do you want the voters to have? (Last option before you reached the limit)';
	}

	private showPoll(
		message: Message,
		{ id, multi, options, title, votes }: IStrawPollPoll,
		authorModel: UserModel,
	): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(title, 'https://a.safe.moe/WSpgs.png', `${this.baseURL}/${id}`)
			.setTitle('Are multiple votes allowed?')
			.setDescription(`${multi ? 'Yes ✅' : 'No ❌'}`)
			.setThumbnail(message.guild.iconURL());

		const voteIterator: IterableIterator<number> = votes ? votes[Symbol.iterator]() : undefined;
		for (const option of options) {
			const voteCount: string = voteIterator ? voteIterator.next().value.toLocaleString() : undefined;
			embed.addField(option, voteCount || 'No vote count available', true);
		}

		return message.channel.send(embed);
	}
}

export { StrawPollCommand as Command };
