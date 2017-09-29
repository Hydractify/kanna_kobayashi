// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { inspect } = require('util');

const Command = require('../../structures/Command');

class EvalCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['evaluate'],
			coins: 0,
			cooldown: 0,
			description: 'Evaluates arbitrary JavaScript code',
			examples: ['You should know how to use this.'],
			exp: 0,
			name: 'eval',
			usage: 'You should know how to use this.',
			permLevel: 4
		});
	}

	async run(message, args) {
		const code = args.join(' ');
		try {
			let evaled = await eval(
				code.includes('await')
					? `(async()=>{${code}})()`
					: code
			);

			if (typeof evaled !== 'string') {
				const tmp = inspect(evaled);
				if (tmp.length >= 1985) evaled = inspect(evaled, { depth: 0 });
				else evaled = tmp;
			}

			await message.channel.send(evaled, { code: 'js' });
		} catch (error) {
			await message.channel.send(
				[
					'**Error**',
					'```js',
					String(error),
					'```'
				]
			);
		}
	}
}

module.exports = EvalCommand;
