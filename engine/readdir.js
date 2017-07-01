const { load } = require('../util/log.js');
const fs = require('fs');

module.exports = client => {
  fs.readdir('./commands/', (err, files) => {
    if (err) console.error(err);
    load(`Loading ${files.length} commands.`);
    files.forEach(f => {
      let cmdFile = require(`../commands/${f}`);
      let cmd = new cmdFile(client);
      client.commands.set(cmd.name, cmd);
      cmd.alias.forEach(alias => {
        client.aliases.set(alias, cmd.name);
      });
    });
  });
}
