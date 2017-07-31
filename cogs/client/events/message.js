const embedColor = require('../../../util/client/embed_color');
const errorMessage = require('../../../util/client/error/stack');
const blackFile = require('../../../data/client/blacklist');
const info = require('../../../data/client/info.json');
const { CommandLog, Guild, User } = require('../../../data/Models');
const humanizeDuration = require('humanize-duration');
const whiteFile = require('../../../data/client/whitelist');

const isBotfarm = ({ guild }) => {
    if (whiteFile.includes(guild.ownerID)) return false;
    if (guild.memberCount <= 50) return false;

    let botCount = 0;
    for (const { user: { bot } } of guild.members.values()) {
        if (!bot) continue;
        if (++botCount > guild.memberCount / 2) return true;
    }

    return false;
};

module.exports = async (client, message) => {
    if (message.channel.type !== 'text') return;
    if (message.author.bot) return;
    if (blackFile.includes(message.guild.owner.user.id)) return;
    if (blackFile.includes(message.author.id)) return;
    if (isBotfarm(message)) return;

    if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
        message.author.send('I do not have the send messages permission for the channel of your command!')
            .catch(() => null);
        return;
    }

    let guild;
    try {
        guild = await Guild.get(message.guild.id).run();
    } catch (err) {
        guild = new Guild({ id: message.guild.id });
        guild.save();
    }

    let prefixes = info.defaultPrefixes.slice(0);
    prefixes.push(
        `<@!?${client.user.id}> `,
        guild.prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
    );

    let regex = new RegExp(`^(${prefixes.join('|')})([^]*)`);

    if (!regex.test(message.content)) return;

    let prefixLength = regex.exec(message.content)[1].length;

    let [command, ...args] = message.content.slice(prefixLength).split(' ');
    let cmd = client.commands.get(command);
    let perm = client.perms(message);
    let color = embedColor(message);

    if (!cmd) {
        command = client.aliases.get(command);
        if (command) cmd = client.commands.get(command);
        else return;
    }

    if (perm < cmd.permLevel) {
        message.channel.send(`${message.author}, you don't have the required permission level to use this command!`);
        return;
    }

    let log;
    try {
        log = await CommandLog.filter({ userId: message.author.id, command }).nth(0).run();
    } catch (err) {
        log = new CommandLog({ userId: message.author.id, command });
    }

    let time = new Date();
    let timeLeft = (log.lastUsed ? log.lastUsed.getTime() : 0) + cmd.cooldown - time.getTime();
    if (info.devs.includes(message.author.id) ||
        info.trusted.includes(message.author.id) ||
        log.lastUsed === null ||
        timeLeft <= 0) {
        log.lastUsed = new Date();
    } else {
        timeLeft = humanizeDuration(timeLeft, { round: true, largest: 2, conjunction: ' and ', serialComma: false });
        message.reply(`**${cmd.name}** is on cooldown! Please wait **${timeLeft}**.`);
        return;
    }
    log.save();

    let user;
    try {
        user = await User.get(message.author.id).run();
    } catch (err) {
        user = new User({ id: message.author.id });
    }
    let oldLevel = user.getLevel();
    user.exp += cmd.exp;
    user.coins += cmd.coins;
    user.save();

    if (guild.notifications.levelUp && user.getLevel() > oldLevel) {
        message.channel.send(`Woot! ${message.author}, you are now level ${user.getLevel()}!`);
    }

    if (!cmd.enabled) {
        message.channel.send(`**${cmd.name}** is currently disabled!`);
        return;
    }

    try {
        await cmd.run(message, color, args, perm);
    } catch (err) {
        errorMessage(err, message, cmd);
    }
};
