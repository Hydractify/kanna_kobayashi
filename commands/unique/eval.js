const Command = require('../../cogs/commands/framework');

function clean(text) {
  if (typeof text === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  } else {
    return text;
  }
}

module.exports = class Eval extends Command {
  constructor() {
    super({
      enabled: true,
      alias: ['seeifthisworks'],
      permLevel: 4,
      name: 'eval',
      description: 'Ayy lmao',
      usage: 'eval <code>',
      exp: 0,
      coins: 0,
      cooldown: 1,
    });
  }

  async run(message, pinku, args) {
    try {
      const code = args.join(" ");
      let evaled = eval(code);
      if (typeof evaled !== "string")
      evaled = require("util").inspect(evaled);
      await message.channel.send(`\`\`\`js\n${clean(evaled)}\n\`\`\``);
    } catch (err) {
      await message.channel.send(`**Error**\n\`\`\`js\n${clean(err)}\n\`\`\``);
    }
  }
}
