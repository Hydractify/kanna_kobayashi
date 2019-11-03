module.exports =
{
	env:
	{
		node: true,
	},
	extends:
	[
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions:
	{
		ecmaFeatures:
		{
			jsx: false,
		},
		ecmaVersion: 2019,
		project: `${__dirname}/tsconfig.json`,
		sourceType: 'module',
	},
	plugins:
	[
		'@typescript-eslint',
	],
	root: true,
	rules:
	{
		/*
		 * ESLint rules
		 */
		'brace-style':
		[
			'error',
			'allman',
		],
		'curly':
		[
			'error',
			'multi',
		],
		'indent': 'off',
		'quotes':
		[
			'error',
			'single',
		],
		'quote-props':
		[
			'error',
			'as-needed',
		],
		'semi':
		[
			'error',
			'always',
		],
		'no-unexpected-multiline': 'off',
		'radix': 'off',
		/*
		 * TSLint rules
		 */
		'@typescript-eslint/array-type':
		[
			'error',
			'array',
		],
		'@typescript-eslint/indent':
		[
			'error',
			'tab',
		],
		'@typescript-eslint/interface-name-prefix':
		[
			'error',
			'always',
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-var-requires': 'warn',
	}
};
