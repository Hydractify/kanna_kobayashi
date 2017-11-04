const Command = require('../../structures/Command');

class BanCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['banne'],
			clientPermissions: ['BAN_MEMBERS', 'USE_EXTERNAL_EMOJIS'],
			coins: 10,
			cooldown: 5000,
			enabled: true,
			description: 'Ban a user... Or a lot of them!',
			examples: ['ban wizard', 'ban wizard anxeal space'],
			exp: 850,
			name: 'ban',
			usage: 'ban <User>',
			permLevel: 0
		});
	}

	async run(message, targets) {
		if (!targets.length) return message.reply('you must provide me a user or users to ban!');

		const members = new Set();
		for (let input of targets) {
			const member = await this.handler.resolveMember(message.guild, input);
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
		if (!members.size) return message.reply(`I am not able to ban **${targets.join('**, **')}**!`);

		message.reply(`are you sure you want to ban ${mentions.join(' ')}? (**Y**es or **N**o)`);

		const answer = await message.channel.awaitMessages(msg => /^(y|n|yes|no)/i.exec(msg), { errors: ['time'], time: 60 * 1000, max: 1 })
		.catch(() => null);

		if (!answer) return message.reply('as you did not told me yes or no, i have canceled the ban <:KannaAyy:315270615844126720>');

		if (/^(y|yes)/i.exec(answer.first())) {
			for (const member of members.values()) {
				await member.ban(2);
			}
			return message.reply(`i have sucessfully banned ${mentions.join(' ')}!`);
		} else {
			return message.channel.send('Ok, canceling the ban! <:KannaAyy:315270615844126720>');
		}
	}
}

module.exports = BanCommand;
