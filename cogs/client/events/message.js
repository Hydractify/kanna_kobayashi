module.exports = async (message) =>
{	if (message.author.id !== '267727230296129536') return;
	if(message.content === 'plswork') return message.channel.send('Wew it worked');	}