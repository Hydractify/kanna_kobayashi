class Command {
    constructor(options = {}) {
        const { client } = require('../connections/discord');
        if (!options.name) throw new Error('This command must have a name!');
        if (!Array.isArray(options.alias) && typeof options.alias !== 'undefined') throw new Error('Alias must be an Array!');
        if (!Array.isArray(options.example) && options.example) throw new Error('Example must be an Array!');
        if (typeof options.name !== 'string') throw new Error('Command name must be a String!');
        if (typeof options.category !== 'string' && options.category) throw new Error('Command category must be a string ');

        this.client = client;
        this.description = options.description;
        this.alias = options.alias || [];
        this.name = options.name;
        this.permLevel = (typeof options.permLevel === 'undefined') ? 0 : options.permLevel; // 0 = Everyone, 1 = Dragon Tamer (Event Role), 2 = Permission biased and Mod Role, 3 = Support on official guild, 4 = Devs
        this.enabled = options.enabled;
        this.usage = options.usage || options.name;
        this.example = options.example;
        this.exp = options.exp || 75;
        this.coins = options.coins || 50;
        this.cooldown = options.cooldown || 5000; // Miliseconds
    }
}

module.exports = Command;
