const Discord = require('discord.js');
const Command = require('../engine/commandClass');
let level = 1;
let xp = 0;
let xpNeeded = 100;
let xpBase = 15;

module.exports = class QuickCmd extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      alias: ['cdncjdnjcd'],
      permLevel: 4,
      name: 'cmd',
      description: 'Aycdcdcdcdcdmao',
      usage: 'ecdcdcddcode>',
      category: 'cdcdcdcdcd'
    })
  }
  run(client, message, pinku, args) {
    if(xp < xpNeeded && xp + xpBase <= xpNeeded) {
      xp += xpBase;
    } else {
      xp += xpBase - xpNeeded;
      xpNeeded *= 1.2; //Multiply how much xp changes by
      ++level;
    }
      message.channel.send(`Level: ${level} | XP: ${xp} | Needed: ${xpNeeded}`);
}
}
