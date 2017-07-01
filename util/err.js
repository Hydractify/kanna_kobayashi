module.exports = class err {
  static stack(e) {
    message.channel.send(`This shouldn't have happened! Report this to the official guild\n\`\`\`js\n${e.stack}\n\`\`\`\nhttp://kannathebot.me/guild/`);
  }

  static perm(p) {
    message.channel.send(`Can't execute this command due to lack of the Discord permission **${p}**`);
  }

  static user(u) {
    message.channel.send(`Couldn't find **${u}**`);
  }
} 
