const embed_color = require('../../../util/client/embed_color');
const error_message = require('../../../util/client/error/stack');
const blackFile = require('../../../data/client/blacklist');

module.exports = async(client, message) => {
    if (blackFile.includes(message.guild.owner.user.id)) return;
    if (blackFile.includes(message.author.id)) return;
    if (message.content.startsWith('kanna pls ')) {
        let command = message.content.split('kanna pls ')[1].split(' ')[0].toLowerCase();
        let cmd = client.commands.get(command);
        let perm = client.perms(message);
        let args = message.content.split(' ').slice(3);
        let color = embed_color(message);
        if (!cmd) {
            let alias = client.aliases.get(command);
            if (alias) cmd = client.commands.get(alias);
        }
        if(!cmd) return; // Command doesn't exist
        if(perm < cmd.permLevel) return message.channel.send(`${message.author} you don't have permission to use that command!`); // Not enough permission
        // TODO: Add exp, coins, check for cooldown and log when command is used
        try {
            await cmd.run(message, color, args);
        } catch (err) {
            error_message(err, message, cmd);
        }
    }
}