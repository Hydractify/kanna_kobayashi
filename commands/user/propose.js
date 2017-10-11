const Command = require('../../structures/Command');

class ProposeCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['marry'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			cooldown: 10000,
			enabled: true,
			description: 'Propose to someone... You love! <:KannaAyy:315270615844126720>',
			examples: ['propose Wizard'],
			exp: 0,
			name: 'propose',
			usage: 'propose <User>',
			permLevel: 0
		});
	}

	async run(message, args) {
		if (!args[0]) return message.reply(`you must give me an user! (\`${this.usage}\`)`);

		const checked = await this.relationCheck(message, args);
		if (!checked) return;
		await this.relationStart(message, args);
	}

	async relationStart(message, [input]) {
		const mentionedUser = await this.handler.resolveUser(input, false);
		const mentionedModel = mentionedUser.model || mentionedUser.fetchModel();

		const authorModel = message.author.model || await message.author.fetchModel();

		await message.channel.send(`${mentionedUser} you have received a propose from ${message.author}! Do you accept it? (**Y**es / **N**o`);
		
		const filter = msg => msg.author.id === mentionedUser.id
		&& /^(y|n|yes|no)/i.test(msg.content);
		
		const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });
		
		if (!collected.size) {
			return message.channel.send([
				`${message.author}... as you didn't told me yes or no,`,
				'I had to cancel the command <:FeelsKannaMan:341054171212152832>'
			].join(' '));
		}
		
		if (/^(y|yes)/i.test(collected.first())) {
			authorModel.setPartner(mentionedUser.id);
			mentionedModel.setPartner(message.author.id);

			authorModel.partnerSince = message.createdTimestamp;
			mentionedModel.partnerSince = message.createdTimestamp;

			await mentionedModel.save();
			await authorModel.save();
			return message.channel.send(`Congratulations ${message.author} and ${mentionedUser}! In a month if you two are still together, use propose again so you two can marry! <:KannaHello:345776146404605952>`);
		}				
	}

	async relationCheck(message, [input]) {
		const mentionedUser = await this.handler.resolveUser(input, false);

		const authorModel = message.author.model || await message.author.fetchModel();
		const authorPartner = await authorModel.getPartner();
		if (authorPartner && authorPartner.id !== mentionedUser.id) {
			await message.reply(`are you sure you want to break with you current partner? (**Y**es or **N**o) <:KannaWtf:320406412133924864>`);

			const filter = msg => msg.author.id === mentionedUser.id
			&& /^(y|n|yes|no)/i.test(msg.content);
	
			const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });
	
			if (!collected.size) {
				await message.channel.send([
					`${message.author}... as you didn't told me yes or no,`,
					'I had to cancel the command <:KannaWtf:320406412133924864>'
				].join(' '));
				return false;
			}

			if (/^(y|yes)/i.test(collected.first())) {
				authorModel.partner_id = null;
				authorModel.partnerSince = null;
				await authorModel.save();
				return true;
			}

			if (/^(n|no)/i.test(collected.first())) await message.channel.send('Canceling the command... <:KannaWtf:320406412133924864>');
			return false;
		} 
		else if (!authorPartner) return true;
		else {
			if ((authorPartner.partnerSince - (24 * 60 * 60 * 1000 * 30)) < message.createdTimestamp) {
				await message.reply('sorry but not enough time has passed before you two are able to marry! <:KannaAyy:315270615844126720>');
				return false;
			}
			await message.channel.send(`${mentionedUser}... Are you two ready to marry with ${message.author}? (**Y**es or **N**o)`);

			const filter = msg => msg.author.id === mentionedUser.id
			&& /^(y|n|yes|no)/i.test(msg.content);
	
			const collected = await message.channel.awaitMessages(filter, { time: 10000, maxMatches: 1 });
	
			if (!collected.size) {
				await message.channel.send([
					`${message.author}... as you didn't told me yes or no,`,
					'I had to cancel the command <:KannaAyy:315270615844126720>'
				].join(' '));
				return false;
			}

			if (/^(y|yes)/i.test(collected.first())) {
				const mentionedModel = mentionedUser.model || await mentionedUser.fetchModel();
				
				mentionedModel.partnerMarried = true;
				authorModel.partnerMarried = true;
				await authorModel.save();
				await mentionedModel.save();
				
				await message.channel.send(`Congratulations ${message.author} and ${mentionedUser} for your marriage! <:KannaHug:299650645001240578>`);
				return false;
			}

			if (/^(n|no)/i.test(collected.first())) {
				await message.channel.send('Canceling the command... <:KannaAyy:315270615844126720>');
				return false;
			} 
		}
	}
}

module.exports = ProposeCommand;
