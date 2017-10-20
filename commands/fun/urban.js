const { get } = require('snekfetch');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/util');

class UrbanCommand extends Command {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search up a definition for your query on urbandictonary.',
			examples: ['urban test'],
			name: 'urban',
			usage: 'urban <...Term>'
		});
	}

	async run(message, args, { authorModel }) {
		if (!args.length) {
			return message.channel.send([
				`Hey ${message.author}... You are supposed to tell me what to search`,
				`(\`kanna ${this.usage}\`) <:KannaWtf:320406412133924864>`
			].join(' '));
		}

		const query = encodeURIComponent(args.join('+').replace(/%2B/g, '+'));
		const { body: { list } } = await get(`http://api.urbandictionary.com/v0/define?term=${query}`);

		const embed = RichEmbed.common(message, authorModel)
			.setAuthor(`Search result for ${titleCase(args.join(' '))}`,
				'https://d2gatte9o95jao.cloudfront.net/assets/store-mug-example-256@2x-34cb1d3724cbce5ce790228b5bf8eabe.png')
			.setDescription('\u200b')
			.setThumbnail(message.guild.iconURL);
		embed.footer.text += ' | Powered by urbandictionary';

		if (!list.length) {
			embed.addField('No results', 'Maybe made a typo?')
				.addField('Search:', `[URL](http://www.urbandictionary.com/define.php?term=${query})`);

			return message.channel.send(embed);
		}

		const {
			author,
			definition,
			example,
			thumbs_up: thumbsUp,
			thumbs_down: thumbsDown
		} = list[0];

		embed.addField('Author', author)
			.splitToFields('Definition', definition);

		if (list[0].example) {
			embed.splitToFields('Example', example);
		}

		embed.addField('Thumbs Up <:wave:341330512381607938>', thumbsUp, true)
			.addField('Thumbs Down <:omfg:341330522028507139>', thumbsDown, true);

		return message.channel.send(embed);
	}
}

module.exports = UrbanCommand;
