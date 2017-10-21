// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { inspect } = require('util');

const Command = require('../../structures/Command');
const { instance: { db } } = require('../../structures/Redis');

class EvalCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['evaluate', 'broadcasteval'],
			coins: 0,
			cooldown: 0,
			description: 'Evaluates arbitrary JavaScript code',
			examples: ['You should know how to use this.'],
			exp: 0,
			name: 'eval',
			usage: 'You should know how to use this.',
			permLevel: 4
		});

		this._inspect = { depth: 0 };
	}

	async run(message, args, name) {
		let code = args.join(' ');
		if (code.includes('await')) code = `(async()=>{${code}})()`;
		try {
			let evaled = name === 'broadcasteval'
				? await this.client.shard.broadcastEval(code)
				: await eval(code);

			if (typeof evaled !== 'string') {
				const tmp = inspect(evaled, this._inspect);
				if (tmp.length >= 1985) evaled = inspect(evaled, this._inspect);
				else evaled = tmp;
			}

			return message.channel.send(evaled || '\u200b', { code: 'js' });
		} catch (error) {
			return message.channel.send(
				[
					'**Error**',
					'```js',
					String(error),
					'```'
				]
			);
		}
	}

	get depth() {
		return this._inspect.depth;
	}
	set depth(value) {
		this._inspect.depth = value;
	}
}

module.exports = EvalCommand;
