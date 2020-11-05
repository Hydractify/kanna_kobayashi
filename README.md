<div>
	<p>
		<a href="https://www.hydractify.org">
			<img src="https://cdn.discordapp.com/attachments/430532424280178688/580901034327670836/banner.png" />
		</a>
	</p>
	<p align="center">
		<a href="https://github.com/Hydractify/kanna_kobayashi/blob/stable/package.json#L3">
			<img src="https://img.shields.io/badge/kanna_kobayashi-v4.7.1-fcbbd5.svg?style=flat-square" />
		</a>
		<a href="https://www.hydractify.org/discord">
			<img src="https://img.shields.io/discord/298969150133370880.svg?style=flat-square&logo=discord">
		</a>
		<a href="https://www.hydractify.org/patreon">
			<img src="https://img.shields.io/badge/Patreon-support!-fa6956.svg?style=flat-square&logo=patreon" />
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

[Kanna Kobayashi] is a community driven open-source application bot for Discord, based on the character [Kanna Kamui] from the [anime] known as [Kobayashi-san Chi no Maid Dragon] by [KyoAni] (Kyoto Animation Studios). This application is made with the intent of enriching the experience, as well as interactions, between our end users; It also serves as a project to improve our own skills.

## Getting started

These are the tools you will need to have installed to get the project up and running:

1. [NodeJS];
    - > It is highly recommend to always install the current version instead of [LTS], as we are constantly updating the project to it's latest installment.
1. [Yarn];
1. [PostgreSQL].

After you are over installing everything, [clone] our repository into wherever you want. Then open a terminal in that directory and run `yarn install` in a terminal to install all it's dependencies.

### Setting up

Make a copy of the [`data.example.json`] file as `data.json` in the root directory of the project, and fill it's blanks.

```js
{
	"clientToken": "",      // discord application token -> https://discordapp.com/developers/applications/
	"dbots": "",            // token for https://top.gg/
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

After filling, go in your [PostgreSQL] and create a user with the name `kanna` and the following password: `kannapw`. Then create a database called `kanna`. Once finished, do `yarn build` to transpile the `*.ts` files. Right after, execute `node ./bin/scripts/buildItems.js && node ./bin/scripts/createTriggers.js`.

Congratulations! You have everything set-up now, all that is left is to run the application with `yarn run`!

## Disclaimers

All licenses to [Kobayashi-san Chi no Maid Dragon] and [Kanna Kamui] are reserved to [KyoAni] and [coolkyou]. We are not responsible for any modified versions of [Kanna Kobayashi] that may be made. If you would like to claim authorship in any of our code or content, feel free to e-mail us at support@hydractify.org without any hesitation.

> [Kanna Kobayashi], the Discord application bot.
> Copyright (C) 2017-2020 Hydractify

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
