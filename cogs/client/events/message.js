const check_perm;

module.exports = async(client, message) => {
    if (message.content.startsWith('kanna pls ')) {
        let command = message.content.split('kanna pls ')[1].split(' ')[0].toLowerCase();
        let cmd = client.commands.get(command);
        if (!cmd) {
            let alias = client.aliases.get(command);
            if (alias) cmd = client.commands.get(alias);
        }
        if(!cmd) return; // Command doesn't exist
        if(check_perm(client, message.member, message) < cmd.permLevel) return; // Not enough permission
        // TODO: Add exp, coins, check for cooldown and log when command is used
        try {
            await cmd.run(client, message);
        } catch (err) {
            require('../../../util/client/error/stack')(err, message, cmd);
        }
    }
}