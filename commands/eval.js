const Command = require('../engine/commandClass.js');

function clean(text) {
  if (typeof text === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      alias: ['seeifthisworks'],
      permLevel: 4,
      name: 'eval',
      description: 'Ayy lmao',
      usage: 'eval <code>',
      category: 'unique'
    })
  }
  async run(client, message, pinku, args, perms, rest) {
    try{
                   var code = args.join(" ");
                   var evaled = eval(code);
                   if (typeof evaled !== "string")
                     evaled = require("util").inspect(evaled);
                       await message.channel.send(`\`\`\`js\n${clean(evaled)}\n\`\`\``);
               } catch (err) {
                   await message.channel.send(`**Error**\n\`\`\`js\n${clean(err)}\n\`\`\``);
               }
  }
}
