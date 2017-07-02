module.exports = class err {
  static stack(e, msg) {
    if(typeof msg !== 'object') throw new Error('Error throwed an error message, should be an object!');

    msg.channel.send(`This shouldn't have happened! Report this to the official guild\n\`\`\`js\n${e.stack}\n\`\`\`\nhttp://kannathebot.me/guild/`);
  }

  static perm(p, msg) {
    if(typeof msg !== 'object') throw new Error('Error throwed an error message, should be an object!');

    msg.channel.send(`Can't execute this command due to lack of the Discord permission **${p}**`);
  }

  static user(u, msg) {
    if(typeof msg !== 'object') throw new Error('Error throwed an error message, should be an object!');

    msg.channel.send(`Couldn't find **${u}**`);
  }
}
