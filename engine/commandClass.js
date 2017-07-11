class Command {
  constructor(client, options = {})
  {
    if(typeof client !== 'object' || typeof options !== 'object') throw new Error('Constructor must be an object!');
    if(!options.alias) throw new Error('This command must have an alias!');
    if(!options.name) throw new Error('This command must have a name!');
    if(!Array.isArray(options.alias)) throw new Error('Alias must be an Array!');
    if(!Array.isArray(options.example) && options.example) throw new Error('Example must be an Array!');
    if(typeof options.name !== 'string') throw new Error('Command name must be a String!');
    if(typeof options.category !== 'string' && options.category) throw new Error('Command category must be a string ');

    this.client = client;
    this.description = options.description || 'No description provided.';
    this.alias = options.alias;
    this.name = options.name;
    this.category = options.category || 'common'; // This will be used on -kanna pls help-
    this.permLevel = options.permLevel || 0; // 0 = Everyone, 1 = Dragon Tamer (Event Role), 2 = Permission biased and Mod Role, 3 = Support on official guild, 4 = Devs
    this.enabled = options.enabled;
    this.usage = options.usage || options.name;
    this.example = options.example || 'No example provided.';
    this.exp = options.exp || 75; // 100 is base EXP
    this.coins = options.coins || 50; // 100 is Coin start
    this.cooldown = options.cooldown || 5000; // Miliseconds
  }
}

module.exports = Command;
