const AniListCommand = require('../../structures/AniListCommand');

class AnimeCommand extends AniListCommand {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific anime on anilist',
			examples: ['anime Miss Kobayashi\'s Dragon Maid'],
			name: 'anime',
			type: 'anime',
			usage: 'anime <...Search>'
		});
	}

	async run(message, args, { authorModel }) {
		if (!args.length) return message.reply('you have to tell me what anime you are looking for!');

		const entries = await this.search(args.join(' '));

		if (!entries) return message.reply('I could not find a single anime matching your search!');

		const entry = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry)
		);
	}
}

module.exports = AnimeCommand;
