const Command = require('../../structures/Command');

const { parseFlags } = require('../../util/util');

class BanCommand extends Command {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['KICK_MEMBERS', 'USE_EXTERNAL_EMOJIS'],
			coins: 10,
			cooldown: 5000,
			enabled: true,
			description: 'Kick a user... Or a lot of them!',
			examples: ['kick wizard', 'kick wizard anxeal space'],
			exp: 850,
			name: 'kick',
			usage: 'kick <...User>',
			permLevel: 0
		});
	}

	async run(message, targets) {
		if (!targets.length) return message.reply('you must provide me with at least one user to kick!');

		const members = new Set();
		for (let input of targets) {
			const member = await this.handler.resolveMember(message.guild, input);
			if (!member) continue;
			members.add(member);
		}

		const mentions = [];
		for (const member of members.values()) {
			if (!member.bannable || member.permLevel() >= 2) {
				members.delete(member);
				continue;
			}
			mentions.push(member.toString());
		}
		if (!members.size) return message.reply(`I am not able to kick **${targets.join('**, **')}**!`);

		message.reply(`are you sure you want to kick ${mentions.join(' ')}? (**Y**es or **N**o)`);

		const answer = await message.channel.awaitMessages(msg => /^(y|n|yes|no)/i.exec(msg), { time: 60 * 1000, max: 1 });

		if (!answer.size) {
			return message.reply('as you did no answer my question, i have canceled the kick <:KannaAyy:315270615844126720>');
		}

		if (/^(y|yes)/i.exec(answer.first())) {
			for (const member of members.values()) {
				await member.kick();
			}
			return message.reply(`I have successfully kicked ${mentions.join(' ')}!`);
		}

		return message.channel.send('Ok, canceling the kick! <:KannaAyy:315270615844126720>');
	}
}

module.exports = BanCommand;
