const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const User = require('../../models/User');
const Item = require('../../models/Item');
const { titleCase } = require('../../util/util');

class ProfileCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['pf'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 5000,
			description: 'Display someones or your own profile.',
			examples: ['profile', 'profile wizard'],
			exp: 0,
			name: 'profile',
			usage: 'profile [User]'
		});
	}

	async run(message, [input]) {
		const user = input
			? await this.handler.resolveUser(input, false)
			: message.author;

		if (!user) return message.reply(`I could not find a non-bot user by **${input}**.`);

		// No redis caching here because of includes, which wouldn't work then :c
		// Better than a bunch of single queries tho
		const [userModel] = await User.findCreateFind({
			include: [{
				as: 'items',
				joinTableAttributes: ['count'],
				model: Item,
				required: false
			}, {
				as: 'badges',
				joinTableAttributes: ['count'],
				model: Item,
				required: false
			}, {
				as: 'partner',
				model: User,
				required: false
			}],
			where: { id: user.id }
		});

		const partner = userModel.partner
			? this.client.users.get(userModel.partner.id)
			|| await this.client.fetchUser(userModel.partner.id).catch(() => null)
			: null;
		const partnerString = partner
			? `${partner.partnerMarried ? 'Married' : 'Together'} with **${partner.tag}**`
			: 'Single';

		const embed = RichEmbed.common(message, userModel)
			.setThumbnail(message.guild.iconURL)
			.setAuthor(`${titleCase(user.username)}'s Profile`, user.displayAvatarURL)
			.setDescription('\u200b')
			.addField('Level', `${userModel.level} (${userModel.exp} exp)`, true)
			.addField('Kanna Coins', `${userModel.coins} <:coin:330926092703498240>`, true)
			.addField('Items', this.mapItems(userModel.items), true)
			.addField('Badges', this.mapItems(userModel.badges), true)
			.addField('Relationship', partnerString, true);

		return message.channel.send(embed);
	}

	/**
	 * Maps an array of items (or badges) to a readable string.
	 * @param {Item[]} items Array of items to map
	 * @returns {string}
	 */
	mapItems(items) {
		if (!items.length) return 'None';

		const formatted = [];
		for (const item of items) {
			formatted.push(`${item.unique ? '' : `[${item.count}]`} ${item.name}`);
		}

		return formatted.join('\n');
	}
}

module.exports = ProfileCommand;
