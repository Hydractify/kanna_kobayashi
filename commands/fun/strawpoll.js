const { get, post } = require('snekfetch');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class StrawpollCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['poll'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Create or display a strawpoll',
			examples: ['strawpoll 1', 'strawpoll'],
			exp: 0,
			name: 'strawpoll',
			usage: 'strawpoll [ID]'
		});

		this.baseURL = 'http://strawpoll.me';
		this.apiURL = `${this.baseURL}/api/v2/polls`;
	}

	async run(message, [id], { authorModel }) {
		if (id) {
			const { body: poll } = await get(`${this.apiURL}/${id}`)
				.set('Content-Type', 'application/json')
				.catch(() => ({ body: null }));
			if (!poll) return message.reply('I could not find a strawpoll with that ID.');

			return this.showPoll(message, poll, authorModel);
		}

		const data = [];
		/* eslint-disable no-await-in-loop */
		for (const question of this.questions()) {
			const promptMessage = await message.reply(question);

			const response = await message.channel
				.awaitMessages(msg => msg.author.id === message.author.id, { maxMatches: 1, time: 30 * 1000 })
				.then(collected => collected.first());

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
					promptMessage.delete()
				]).catch(() => null);
			}

			data.push(response.content);
		}
		/* eslint-enable no-await-in-loop */

		const [title, multi, ...options] = data;

		const { body: poll } = await post(this.apiURL)
			.set('Content-Type', 'application/json')
			.send({
				title,
				multi: multi[0].toLowerCase() === 'y',
				options
			});

		return this.showPoll(message, poll, authorModel);
	}

	* questions() {
		yield 'what should the name of the poll be?';
		yield 'should voters be allowed to vote for more than one option? (`y`/anything)';
		// 1
		yield 'what options do you want the voters to have? (Enter one at a time, you need at least two more)';
		// 2
		yield 'what options do you want the voters to have? (Enter one at a time, you need at least one more)';

		// 3 - 29
		for (let i = 0; i < 27; ++i) {
			yield 'what options do you want the voters to have? (Enter one at a time, or `end` to tell me you are done)';
		}

		// 30
		return 'what options do you want the voters to have? (Last option before you reached the limit)';
	}

	showPoll(message, { id, multi, options, title, votes }, authorModel) {
		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(title, 'https://a.safe.moe/WSpgs.png', `${this.baseURL}/${id}`)
			.setTitle(`Are multiple votes allowed?`)
			.setDescription(`${multi ? 'Yes ✅' : 'No ❌'}`)
			.setThumbnail(message.guild.iconURL);

		const voteIterator = votes ? votes[Symbol.iterator]() : null;
		for (const option of options) {
			const voteCount = voteIterator ? voteIterator.next().value.toLocaleString() : null;
			embed.addField(option, voteCount || 'No vote count available', true);
		}

		return message.channel.send(embed);
	}
}

module.exports = StrawpollCommand;
