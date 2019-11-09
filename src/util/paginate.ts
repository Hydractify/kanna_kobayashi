// tslint:disable interface-over-type-literal max-line-length

/**
 * Copyright 2017 Schuyler Cebulskie
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Full license: https://github.com/Gawdl3y/discord.js-commando/blob/ea63abfb1cc31c12e5904d9a4919401ccd24e43c/LICENSE
 * File in question: https://github.com/Gawdl3y/discord.js-commando/blob/ea63abfb1cc31c12e5904d9a4919401ccd24e43c/src/util.js#L6
 */

export interface IPaginatedPage<T> {
	items: T[];
	maxPage: number;
	page: number;
	pageLength: number;
}

export const paginate: <T>(items: T[], page: number, pageLength: number) => IPaginatedPage<T>
	= <T>(items: T[], page: number, pageLength: number): IPaginatedPage<T> =>
	{
		const maxPage: number = Math.ceil(items.length / pageLength);
		if (page < 1) page = 1;
		if (page > maxPage) page = maxPage;
		const startIndex: number = (page - 1) * pageLength;

		return {
			items: items.length > pageLength
				? items.slice(startIndex, startIndex + pageLength)
				: items,
			maxPage,
			page,
			pageLength,
		};
	};
