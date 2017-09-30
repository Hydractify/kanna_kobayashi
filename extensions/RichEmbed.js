const Extension = require('./Extension');

class RichEmbed extends Extension {
  constructor(data) {
    super(data);
  }

  async common(message) {
    const User = await message.author.fetchModel();
    let Embed = this
    .setColor(message.client.color(User))
    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL);

    return Embed;
  }
}

module.exports = RichEmbed;
