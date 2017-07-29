const Command = require('../../cogs/commands/framework'); 

module.exports = class Ping extends Command 
{ constructor() 
 { super( 
   { alias: ['pong'], 
	 name: 'ping', 
	 exp: 0, 
	 coins: 0, 
	 enabled: true }); } 

 async run(message) 
 { let pingo = await message.channel.send('Eating insects...'); 

   await pingo.edit(`I took \`${pingo.createdTimestamp - message.createdTimestamp} ms\` to eat all of them <:oh:315264555859181568>`); } }