const AniListCommand = require('../../structures/AniListCommand');

class MangaCommand extends AniListCommand {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific manga on anilist',
			examples: ['manga Miss Kobayashi\'s Dragon Maid'],
			name: 'manga',
			type: 'manga',
			usage: 'manga <...Search>'
		});
	}

	async run(message, args, { authorModel }) {
		if (!args.length) return message.reply('you have to tell me what manga you are looking for!');

		const entries = await this.search(args.join(' '));

		if (!entries) return message.reply('I could not find a single manga matching your search!');

		const entry = entries.length > 1
			? await this.pick(message, authorModel, entries)
			: entries[0];

		if (!entry) return message.reply('aborting then.');

		return message.channel.send(
			this.buildEmbed(message, authorModel, entry)
		);
	}
}

module.exports = MangaCommand;
