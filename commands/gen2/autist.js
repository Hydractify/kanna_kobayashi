const Command = require('../../cogs/commands/framework'); 
const meme = require('../../util/embeds/meme'); 
 
module.exports = class Autist extends Command 
{ 
  constructor() 
  { super( 
    { alias: ['autistic'], 
      name: 'autist', 
      enabled: true }); } 
 
  async run(message, color) 
  { let autist = require('../../data/links').memes.autist; 
    let img = autist[Math.floor(Math.random() * autist.length)]; 
    await message.channel.send({embed : meme(img, color, message)});  } }