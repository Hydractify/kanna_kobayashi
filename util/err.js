var err = {
  stack: e => {
    message.channel.send(`This shouldn't have happened! Report this to the official guild\n\`\`\`js\n${e.stack}\n\`\`\`\nhttp://kannathebot.me/guild/`);
  },
  perm: p => {
    message.channel.send(`Can't execute this command due to lack of the Discord permission **${p}**`);
  },
  user: u => {
    message.channel.send(`Couldn't find **${u}**`);
  }
}

module.exports = err;
