import { handleInteraction } from './commands/handler.js';
import { DISCORD_PUBLIC_KEY, PORT } from './config.js';
import { init as sentryInit } from './sentry.js';
import { createServer } from './server.js';

console.info('Starting');

sentryInit();

createServer(DISCORD_PUBLIC_KEY, handleInteraction).listen(PORT, () => console.info('Listening'));
