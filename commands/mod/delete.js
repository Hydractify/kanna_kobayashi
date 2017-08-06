const Command = require('../../cogs/commands/framework');

module.exports = class Delete extends Command {
  constructor() {
    super({
      alias: ['purge', 'prune'],
      permLevel: 2,
      name: 'delete',
      description: 'Delete up to 100 messages!!',
      usage: 'delete <number>',
      coins: 0,
      exp: 0,
      enabled: true
    });
  }

  async run(message, color, args) {
    if(!message.guild.me.hasPermission('MANAGE_MESSAGES')) {
      await message.channel.send(`I don't have permission to delete messages ${message.author}!`);
      return;
    }
    if(!message.member.permissions.has('MANAGE_MESSAGES')) {
      await message.channel.send(`You don't have permission to delete messages ${message.author}!`);
      return;
    }

    if(!parseInt(args[0])) {
      await message.channel.send(`${message.author} you must provide a number!`);
      return;
    }

    if(args[0] == 1 || parseInt(args[0]) > 100) {
      await message.channel.send(`You have to choose a number between 2 and 100 ${message.author}!`);
      return;
    }

    await message.delete();

    let messages = await message.channel.fetchMessages({limit : args[0]});

    await message.channel.bulkDelete(messages)
    .catch(() => {
      message.channel.send(`I couldn't delete some messages, they were too old!`);
      return;
    });

    await message.channel.send(`I have deleted **${args[0]}** messages! <:police:331923995278442497>`);
  }
}
