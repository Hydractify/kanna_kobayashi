/**
 * Copyright (c) 2011-2016 Heather Arthur <fayearthur@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Repo: https://github.com/Qix-/color-convert
 * File: https://github.com/Qix-/color-convert/blob/11e305447ee9001d130f0876a45019646e661998/conversions.js#L314-L340
 */

import { Util } from 'discord.js';

export const generateColor: () => number = (): number => {
	const h: number = ((Math.random() * 150) + 250) / 60;
	const s: number = ((Math.random() * 50) + 50) / 100;
	let v: number = ((Math.random() * 50) + 50) / 100;
	const hi: number = Math.floor(h) % 6;

	const f: number = h - Math.floor(h);

	const p: number = v * 255 * (1 - s);
	const q: number = v * 255 * (1 - (s * f));
	const t: number = v * 255 * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return Util.resolveColor([v, t, p]);
		case 1:
			return Util.resolveColor([q, v, p]);
		case 2:
			return Util.resolveColor([p, v, t]);
		case 3:
			return Util.resolveColor([p, q, v]);
		case 4:
			return Util.resolveColor([t, p, v]);
		case 5:
			return Util.resolveColor([v, p, q]);
		default:
			// You're welcome, tslint
			throw new Error(`Arithmetic failure with HSV conversion, technically impossible.\nGot value: ${hi}`);
	}
};
