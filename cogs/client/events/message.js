module.exports = async (client, message) =>
{	if (message.author.id !== '267727230296129536') return;
	if(message.content === 'pls ping')
	{	let msg = await message.channel.send('Pinging...');
		msg.edit(`Pong \`${msg.createdTimestamp - message.createdTimestamp} ms\``);	}	}