import { Collection, Message, Snowflake } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { APIRouter, buildRouter } from '../../structures/Api';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { IStrawPollPoll } from '../../types/IStrawPollPoll';

// tslint:disable-next-line:variable-name
const Api: () => APIRouter = buildRouter({
	baseURL: 'https://www.strawpoll.me/api/v2/polls',
	defaultHeaders: {
		accept: 'application/json',
		'content-type': 'application/json',
	},
});

class StrawPollCommand extends Command
{
	private baseURL: string;

	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['poll'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Create or display a strawpoll',
			examples: ['strawpoll 1', 'strawpoll'],
			usage: 'strawpoll [ID]',
		});

		this.baseURL = 'https://www.strawpoll.me';
	}

	public async run(
		message: GuildMessage,
		[id]: string[],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]>
	{
		if (id)
		{
			const res: string = await Api()[id].get({ type: 'text' }).catch(() => null);

			let fetchedPoll: IStrawPollPoll | undefined;
			try
			{
				fetchedPoll = JSON.parse(res);
			}
			catch
			{ } // eslint-disable-line no-empty

			if (!fetchedPoll) return message.reply('I could not find a strawpoll with that ID.');

			return this.showPoll(message, fetchedPoll, authorModel);
		}

		const messages: Message[] = [message as Message];
		const data: string[] = [];
		for (const question of this.questions())
		{

			const [prompt, response] = await Promise.all<Message, Message | undefined>([
				message.reply(question) as Promise<Message>,
				message.channel
					.awaitMessages((msg: GuildMessage) => msg.author.id === message.author.id, { max: 1, time: 30 * 1000 })
					.then((collected: Collection<Snowflake, Message>) => collected.first()),
			]);
			messages.push(prompt);

			if (!response)
			{
				// No answer, aborting
				await this.cleanup(message, messages);
				return message.reply('aborting then.');
			}
			messages.push(response);

			if (response.content.toLowerCase() === 'end')
			{
				// We already have 4 elements, continuing just fine
				if (data.length > 3) break;

				// We do not, abort
				await this.cleanup(message, messages);
				return message.reply('aborting then.');
			}

			data.push(response.content);
		}

		await this.cleanup(message, messages);
		const [title, multi, ...options] = data;

		const poll: IStrawPollPoll = await Api().post({
			data: {
				multi: multi[0].toLowerCase() === 'y',
				options,
				title,
			},
		});

		return this.showPoll(message, poll, authorModel);
	}

	private cleanup(message: GuildMessage, messages: Message[]): undefined | Promise<Collection<Snowflake, Message>>
	{
		if (message.guild.me?.permissionsIn(message.channel).has('MANAGE_MESSAGES') ?? false)
		{
			return message.channel.bulkDelete(messages);
		}
	}

	private * questions(): IterableIterator<string>
	{
		yield 'what should the name of the poll be?';
		yield 'should voters be allowed to vote for more than one option? (`y`/anything)';
		// 1
		yield 'what options do you want the voters to have? (Enter one at a time, you need at least two more)';
		// 2
		yield 'what options do you want the voters to have? (Enter one at a time, you need at least one more)';

		// 3 - 29
		for (let i: number = 0; i < 27; ++i)
		{
			yield 'what options do you want the voters to have? (Enter one at a time, or `end` to tell me you are done)';
		}

		// 30
		return 'what options do you want the voters to have? (Last option before you reached the limit)';
	}

	private showPoll(
		message: GuildMessage,
		{ id, multi, options, title, votes }: IStrawPollPoll,
		authorModel: UserModel,
	): Promise<Message | Message[]>
	{
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(title, 'https://a.safe.moe/WSpgs.png', `${this.baseURL}/${id}`)
			.setTitle('Are multiple votes allowed?')
			.setDescription([
				multi ? 'Yes ✅' : 'No ❌',
				`[Vote!](${this.baseURL}/${id})`,
			])
			.setThumbnail(message.guild.iconURL());

		const voteIterator: IterableIterator<number> | undefined = votes ? votes[Symbol.iterator]() : undefined;
		for (const option of options)
		{
			const voteCount: string | undefined = voteIterator ? voteIterator.next().value.toLocaleString() : undefined;
			embed.addField(option, voteCount || 'No vote count available', true);
		}

		return message.channel.send(embed);
	}
}

export { StrawPollCommand as Command };
