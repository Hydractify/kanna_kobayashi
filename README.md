<div>
	<p>
		<a href="https://www.hydractify.org">
			<img src="https://cdn.discordapp.com/attachments/430532424280178688/580901034327670836/banner.png" />
		</a>
	</p>
	<p align="center">
		<a href="https://github.com/Hydractify/kanna_kobayashi/blob/stable/package.json#L3">
			<img src="https://img.shields.io/badge/kanna_kobayashi-v4.4.0-fcbbd5.svg?style=flat-square" />
		</a>
		<a href="https://www.hydractify.org/discord">
			<img src="https://img.shields.io/discord/298969150133370880.svg?style=flat-square&logo=discord">
		</a>
		<a href="https://www.hydractify.org/patreon">
			<img src="https://img.shields.io/badge/Patreon-support!-fa6956.svg?style=flat-square&logo=patreon" />
		</a>
		<a href="https://trello.com/hydractify/">
			<img src="https://img.shields.io/badge/Trello-hydractify-blue.svg?style=flat-square&logo=trello" />
		</a>
		<a href="https://twitter.com/hydractify">
			<img src="https://img.shields.io/twitter/follow/hydractify.svg?style=social&logo=twitter">
		</a>
		<br />
		<a href="https://travis-ci.org/hydractify/kanna_kobayashi">
			<img src="https://travis-ci.org/hydractify/kanna_kobayashi.svg" />
		</a>
		<a href="https://github.com/Hydractify/kanna_kobayashi/issues">
			<img src="https://img.shields.io/github/issues/Hydractify/kanna_kobayashi.svg?style=flat-square">
		</a>
		<a href="https://github.com/Hydractify/kanna_kobayashi/graphs/contributors">
			<img src="https://img.shields.io/github/contributors/Hydractify/kanna_kobayashi.svg?style=flat-square">
		</a>
		<a href="https://github.com/Hydractify/kanna_kobayashi/blob/stable/LICENSE">
			<img src="https://img.shields.io/github/license/Hydractify/kanna_kobayashi.svg?style=flat-square">
		</a>
		<a href="https://graphs.hydractify.org/d/G0kS04WWz/kanna-kobayashi?orgId=1">
			<img src="https://img.shields.io/badge/Grafana-kanna_kobayashi-orange.svg?style=flat-square&logo=grafana">
		</a>
	</p>
</div>

## Introduction

Kanna Kobayashi is a community oriented open source bot for Discord, based on the character [Kanna Kamui] from the [anime] known as [Kobayashi-san Chi no Maid Dragon] by [KyoAni] (Kyoto Animation Studios). This bot is made with the intent of improving the experience of the end users with one another and also to improve our skills.

## Getting started

The first thing you will need [NodeJS] which we highly recommend to get the current instead of [LTS] as we work with it. We use [Yarn] for dependecy management, so you also will need that. The last thing you need installed is [PostgreSQL]. After you are over installing everything, [clone] our repository into wherever you want, open a terminal in that directory and run `yarn install` in a terminal.

### Setting up

Make a copy of the [`data.example.json`] file as `data.json` and fill the blanks.

```js
{
	"clientToken": "",      // discord application token -> https://discordapp.com/developers/applications/
	"dbots": "",            // token for https://discordbots.org/
	"osuToken": "",         // osu! api token -> https://osu.ppy.sh/help/wiki/osu!api
	"ravenToken": "",       // sentry.io token -> https://docs.sentry.io/error-reporting/quickstart/
	"webhook": {
		"id": "",         // webhook's id
		"secret": ""      // webhook's secret
	},
	"weebToken": "Bearer <Token>",   // closed api leave it blank -> https://docs.weeb.sh/
	"httpPort": 9000                 // prometheus port -> https://prometheus.io/docs/introduction/overview/ && https://grafana.com/docs/
}
```

After filling, go in your [PostgreSQL] and create a user `kanna` with the password `kannapw` and a database called `kanna`. Once done, do `yarn build` to transpile the `*.ts` files. Right after, execute `node ./bin/scripts/buildItems.js && node ./bin/scripts/createTriggers.js`. That should be it!

## Disclaimers

All licenses to [Kobayashi-san Chi no Maid Dragon] and [Kanna Kamui] are reserved to [KyoAni] and [coolkyou]. We are not responsible for any modified versions of [Kanna Kobayashi] that may be made. If you would like to claim authorship in any of our code or content, feel free to e-mail us at support@hydractify.org without any hesitation.

> Kanna Kobayashi, the Discord robot.
> Copyright (C) 2017-2019 Hydractify

<!-- Introduction -->

[kanna kamui]: https://maid-dragon.fandom.com/wiki/Kanna_Kamui
[anime]: https://en.wikipedia.org/wiki/Anime
[kobayashi-san chi no maid dragon]: https://maid-dragon.fandom.com/wiki/Kobayashi-san_Chi_no_Maid_Dragon_Wiki
[kyoani]: http://www.kyotoanimation.co.jp/

<!-- Getting Started -->

[nodejs]: https://nodejs.org/en/
[lts]: https://en.wikipedia.org/wiki/Long-term_support
[yarn]: https://yarnpkg.com/en/
[postgresql]: https://www.postgresql.org/
[clone]: https://help.github.com/en/articles/cloning-a-repository

<!-- Setting Up -->

[`data.example.json`]: https://github.com/Hydractify/kanna_kobayashi/blob/stable/data.example.json

<!-- Disclaimers -->

[coolkyou]: https://twitter.com/coolkyou2
[kanna kobayashi]: https://github.com/hydractify/kanna_kobayashi
