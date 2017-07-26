const embed_color = require('../../../util/client/embed_color');
const error_message = require('../../../util/client/error/stack');
const blackFile = require('../../../data/client/blacklist');

const { User, CommandLog } = require('../../../data/Models');

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
            if (alias) {
                cmd = client.commands.get(alias);
                command = alias;
            }
        }
        if (!cmd) return; // Command doesn't exist
        if (perm < cmd.permLevel) return message.channel.send(`${message.author} you don't have permission to use that command!`); // Not enough permission

        let log;
        try {
            log = await CommandLog.filter({ userId: message.author.id, command }).nth(0).run();
        } catch (err) {
            log = new CommandLog({ userId: message.author.id, command });
        }

        let time = new Date();

        if (log.lastUsed === null || log.lastUsed.getTime() + cmd.cooldown <= time.getTime()) {
            log.lastUsed = new Date();
        } else {
            return message.reply("pls wait im on kooldaun");
        }
        log.save();

        let user;
        try {
            user = await User.get(message.author.id);
        } catch (err) {
            user = new User({ id: message.author.id });
        }
        user.exp += cmd.exp;
        user.coins += cmd.coins;
        user.save();

        try {
            await cmd.run(message, color, args);
        } catch (err) {
            error_message(err, message, cmd);
        }
    }
}
