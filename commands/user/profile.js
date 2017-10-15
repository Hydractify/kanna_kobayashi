const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/util');

class ProfileCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['pf'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 5000,
			enabled: true,
			description: 'Isn\'t this obvious?',
			examples: ['profile', 'profile wizard'],
			exp: 0,
			name: 'profile',
			usage: 'profile <?User>',
			permLevel: 0
		});
	}

	async run(message, args) {
		let model, user;
		if (!args.length) {
			model = await message.author.fetchModel(); 
			user = message.author;
		}
		else {
			user = await this.handler.resolveUser(args[0]);
			model = await user.fetchModel();
		}

		return message.channel.send(await this.embed(model, user, message));
	}

	async embed(model, user, message) {
		const items = await model.getItems();
		const badges = await model.getBadges();
		const partner = await model.getPartner();

		const embed = RichEmbed.common(message, model)
		.setThumbnail(message.guild.iconURL)
		.setAuthor(`${titleCase(user.username)}'s Profile`, user.displayAvatarURL)
		.setDescription('\u200b')
		.addField('Level', model.level + ` (${model.exp} exp)`, true)
		.addField('Kanna Coins', model.coins + ' <:coin:330926092703498240>', true)
		.addField('Items', items.length ? items.join(', ') : 'None' , true)
		.addField('Badges', badges.length ? badges.join(', ') : 'None', true)
		.addField('Relationship', partner ? `${partner.partnerMarried ? 'Married' : 'With'} **` + (await this.handler.resolveUser(partner.id)).tag + '**' : 'Single', true);
		return embed;
	}
}

module.exports = ProfileCommand;
