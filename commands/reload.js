const Command = require('../engine/commandClass');
const { load } = require('../util/log.js');

module.exports = class Reload extends Command {
  constructor(client){
    super(client, {
      alias: ['r'],
      permLevel: 4,
      name: 'reload',
      description: 'Reloads the command file, if it\'s been updated or modified.',
      usage: 'reload <commandname>',
      category: 'unique'
    })
  }
  async run(client, message, pink, args) {
    try{
    let command;
    if (client.commands.has(args[0])) {
      command = args[0];
    } else if (client.aliases.has(args[0])) {
      command = client.aliases.get(args[0]);
    }
    if (!command) {
      return await message.channel.send(`I cannot find the command: ${args[0]}`);
    } else {
      message.channel.send(`Reloading: ${command}`)
        .then(async m => {
          await client.reload(command)
            .then(async () => {
              await m.edit(`Successfully reloaded: ${command}`);
              load(`Successfully reloaded ${command}`);
            })
            .catch(async e => {
              await m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``);
              load(`Failed reloading ${command}`);
            });
        });
    }
  }catch(err) {
    await message.channel.send(require('../util/err.js').stack(err));
  }
  }
}
