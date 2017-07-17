module.exports = async (client) =>
{	if(!client.user.presence.game)
	{	const a = await client.shard.fetchClientValues('guilds.size');
		const b = a.reduce((p, n) => {	return p + n, 0});
		client.user.setGame(`k!help | on ${b} guilds`);	}	}