const { exec } = require('child_process');
const { Attachment } = require('discord.js');
const { promisify } = require('util');

const Command = require('../../structures/Command');

const execAsync = promisify(exec);

class ExecCommand extends Command {
	constructor(handler) {
		super(handler, {
			coins: 0,
			description: 'Executes arbitrary input on the command line.',
			examples: ['echo hi'],
			exp: 0,
			name: 'exec',
			usage: 'exec <command>',
			permLevel: 4
		});
	}

	async run(message, args) {
		const statusMessage = await message.channel.send('Executing...');
		const { error, stdout, stderr } = await execAsync(args.join(' '))
			.catch(err => ({ err, stdout: err.stdout, stderr: err.stderr }));

		const response = (error && error.code ? `\`Error Code: ${error.code}\`\n\n` : '')
			+ (stdout ? `\`STDOUT\`\n\`\`\`xl\n${stdout}\`\`\`\n\n` : '')
			+ (stderr ? `\`STDERR\`\n\`\`\`xl\n${stderr}\`\`\`\n\n` : '');

		if (response.length <= 2000) {
			return statusMessage.edit(response);
		}

		statusMessage.edit('Executed...');

		return message.channel.send(new Attachment(Buffer.from(response), 'output.txt'));
	}
}

module.exports = ExecCommand;
