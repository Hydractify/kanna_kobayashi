const Command = require('../../structures/Command');

class BanCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['banne', 'exile'],
			clientPermissions: ['BAN_MEMBERS', 'USE_EXTERNAL_EMOJIS'],
			coins: 0,
			description: 'Ban a user... Or a lot of them!',
			examples: ['ban wizard', 'ban wizard anxeal space'],
			exp: 0,
			name: 'ban',
			usage: 'ban <...User>',
			permLevel: 2
		});
	}

	async run(message, targets) {
		if (!targets.length) return message.reply('you must provide me with at least one user to ban!');


		// Valid members to ban
		const members = new Set();
		// Resolved members not to ban
		const failed = new Set();
		// Promises to await, serializing the resolving process
		let promises = [];
		for (const target of targets) {
			promises.push(
				this.handler.resolveMember(message.guild, target).then(member => {
					// Ensure target was found
					if (!member) return;
					// Check whether target is valid
					if (member.bannable && member.permLevel() < 2) {
						members.add(member);
					} else {
						failed.add(member);
					}
				})
			);
		}
		await Promise.all(promises);

		if (failed.size) return message.reply(`I am not able to ban **${[...failed].join('**, **')}**!`);

		message.reply(`are you sure you want to ban ${[...members].join(' ')}? (**Y**es or **N**o)`);

		const answer = await message.channel.awaitMessages(msg => /^(y|n|yes|no)/i.test(msg), { time: 60 * 1000, max: 1 });

		if (!answer.size) {
			return message.reply(
				'since you did not answer my question, I had to cancel the ban. <:KannaAyy:315270615844126720>'
			);
		}

		if (/^(y|yes)/i.test(answer.first().content)) {
			promises = [];
			for (const member of members.values()) {
				promises.push(member.ban(2));
			}
			await Promise.all(promises);

			return message.reply(`I successfully banned ${[...members].join(' ')}!`);
		}

		return message.channel.send('Ok, canceling the ban! <:KannaAyy:315270615844126720>');
	}
}

module.exports = BanCommand;