const AniListCommand = require('../../structures/AniListCommand');

class AnimeCommand extends AniListCommand {
	constructor(handler) {
		super(handler, {
			aliases: ['char'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for a specific character on anilist',
			examples: ['character Kanna Kamui'],
			name: 'character',
			type: 'character',
			usage: 'character <...Search>'
		});
	}

	async run(message, args, { authorModel }) {
		if (!args.length) return message.reply('you have to tell me what character you are looking for!');

		const entries = await this.search(args.join(' '));

		if (!entries) return message.reply('I could not find a single character matching your search!');

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
