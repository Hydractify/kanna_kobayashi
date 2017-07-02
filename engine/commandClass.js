class Command {
  constructor(client, options = {})
  {
    if(typeof client !== 'object' || typeof options !== 'object') throw new Error('Constructor must be an object!');
    if(!options.alias) throw new Error('This command must have an alias!');
    if(!options.name) throw new Error('This command must have a name!');
    if(!Array.isArray(options.alias)) throw new Error('Alias must be an Array!');
    if(typeof options.name !== 'string') throw new Error('Command name must be a String!');
    if(typeof options.category !== 'string' && options.category) throw new Error('Command category must be a string ');
    this.client = client;
    this.options = options.description || 'No description provided.';
    this.alias = options.alias;
    this.name = options.name;
    this.category = options.category;
    this.permLevel = options.permLevel || 0;
    this.enabled = options.enabled || true;
    this.usage = options.usage;
    this.example = options.example;
  }
}

module.exports = Command;
