import { Buffer } from 'node:buffer';
import { createServer as httpCreateServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { captureException, getCurrentHub } from '@sentry/node';
import type { APIInteraction, APIInteractionResponse } from 'discord-api-types/v10';
// tweetnacl is a CommonJS module -> can't use named imports
import { default as tweetnacl } from 'tweetnacl';

export function createServer(
	publicKey: Uint8Array,
	handler: (interaction: APIInteraction) => Promise<APIInteractionResponse>,
) {
	return httpCreateServer(async (req, res) => {
		const hub = getCurrentHub();
		hub.pushScope();

		try {
			// TODO: Maybe use another endpoint?
			if (req.url !== '/interactions') {
				respondPlain(res, 404, 'Not Found');
				return;
			}

			if (req.method !== 'POST') {
				respondPlain(res, 405, 'Method Not Allowed');
				return;
			}

			if (!req.headers['content-type']?.startsWith('application/json')) {
				respondPlain(res, 415, 'Unsupported Media Type');
				return;
			}

			let body = '';
			for await (const chunk of req) {
				body += chunk;
			}

			let payload: APIInteraction;
			try {
				payload = JSON.parse(body);
			} catch (error) {
				console.error('Failed to parse requets body:', error, 'Request body:', body);
				respondPlain(res, 400, 'Bad Request');
				return;
			}

			if (!validateSignature(publicKey, req, body)) {
				respondPlain(res, 401, 'Unauthorized');
				return;
			}

			const response = await handler(payload);

			respondJSON(res, 200, response);
		} catch (error) {
			console.error('An error occured while handling a request:', error);

			if (!res.writableEnded) {
				respondPlain(res, 500, 'Internal Server Error');
			}

			captureException(error);
		} finally {
			hub.popScope();
		}
	});
}

function respondPlain(res: ServerResponse, status: number, content: string): void {
	console.info('Responding with', status, 'and', content);

	res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
	res.write(content);
	res.end();
}

function respondJSON(res: ServerResponse, status: number, content: APIInteractionResponse): void {
	console.info('Responding with', status, 'and', content);

	res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
	res.write(JSON.stringify(content));
	res.end();
}

function validateSignature(publicKey: Uint8Array, req: IncomingMessage, body: string): boolean {
	const signature = req.headers['x-signature-ed25519'];
	const timestamp = req.headers['x-signature-timestamp'];

	if (typeof signature !== 'string' || typeof timestamp !== 'string') {
		return false;
	}

	const msg = Buffer.from(timestamp + body, 'utf8');
	const sig = Buffer.from(signature, 'hex');

	return tweetnacl.sign.detached.verify(msg, sig, publicKey);
}
