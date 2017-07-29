const Discord = require('discord.js');
const Command = require('../../cogs/commands/framework');

module.exports = class Daily extends Command {
    constructor() {
        super({
            alias: ['dailies'],
            name: 'daily',
            coins: 500,
            cooldown: 86400000, // 1 day = 86 400 000 milliseconds
            enabled: true
        });
    }

    async run(message) {
        message.reply(`Here is your daily ${this.coins} <:coin:330926092703498240>`);
    }
};
