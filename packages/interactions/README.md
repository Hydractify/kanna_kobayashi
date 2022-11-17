# Interactions

## Configuration

Copy `.env-sample` to `.env` and fill out all relevant variables.

## Run

First you need to build, you can do so by running `yarn build` or `yarn watch`.
You can either start the process with debugger support through `yarn debug` (using port `9229`) or without through `yarn start`.

## Scripts

Some scripts that are useful, but not required, to run can be found in [`scripts`](./src/scripts/).
These can be started through `yarn` too.

### Register

`yarn register`

This script, as the name suggests, registers command in Discord.
You have to properly configure `.env` for this to work.
Those being The id, secret, and a guild id if you want guild commands (i.e testing).
To globally deploy commands, set `GLOBAL` as guild id.

This script will cache the created access token in `.access_token.json` in the root directory of this package.

### List

`yarn list`

Lists all locally defined commands.
Useful to make sure no import was forgotten somewhere.

## Server

The [`server`](./src/server.ts) module exports a single function called `createServer`.
It accepts two parameters: The `public_key` as a `Uint8Array` and a callback that will be called for each received interaction, which return value will be sent back (mind the 3 second timeout Discord enforces)
It returns a `http.Server` instance. You most likely want to, at least, call `listen` on it.

## Interaction Handler

The [`interaction handler`](./src/commands/handler.ts) module exports a single function called `handleInteraction`.
It accepts one parameter: The received interaction
It sets appropriate tags / extras / breadcrumbs for sentry.
It returns a `Promise<APIResponse>`.
It throws errors if something goes wrong. i.e. (more to be added)

- An unknown (read: yet unhandled and new) interaction type was received
- The interaction is for a command that is not locally defined
- The locally defined command has no suitable callback defined
- Any error is thrown from within the interaction module callback
