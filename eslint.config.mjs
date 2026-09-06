import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
	baseDirectory: configDirectory,
	recommendedConfig: eslint.configs.recommended,
});

export default compat.config({
	extends: ['eslint:recommended', 'next/core-web-vitals', 'plugin:import/recommended', 'prettier'],
	globals: {
		React: 'readonly',
	},
	env: {
		es2021: true,
	},
	ignorePatterns: [
		'.git',
		'.next/',
		'.vscode/',
		'coverage/',
		'node_modules/',
		'out/',
		'next-env.d.ts',
	],
	settings: {
		'import/ignore': ['node_modules'],
	},
	rules: {
		'prefer-const': ['error', { destructuring: 'all' }],
		'import/order': [
			'warn',
			{
				'alphabetize': {
					caseInsensitive: true,
					order: 'asc',
				},
				'groups': ['external', 'builtin', 'parent', ['sibling', 'index']],
				'newlines-between': 'never',
				'pathGroups': [
					{
						group: 'external',
						pattern: 'react',
						position: 'before',
					},
					{
						group: 'external',
						pattern: '@/**',
						position: 'after',
					},
				],
				'pathGroupsExcludedImportTypes': ['builtin'],
			},
		],
		'no-warning-comments': ['warn', { terms: ['fixme'] }],
	},
	overrides: [
		{
			files: ['*.ts', '*.tsx', '*.mts'],
			extends: [
				'plugin:@typescript-eslint/strict-type-checked',
				'plugin:@typescript-eslint/stylistic-type-checked',
			],
			env: {
				browser: true,
			},
			parserOptions: {
				project: true,
			},
			plugins: ['@typescript-eslint'],
			rules: {
				'@typescript-eslint/switch-exhaustiveness-check': 'error',
				'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
			},
		},
		{
			files: ['*.js', '*.jsx'],
			env: {
				node: true,
			},
		},
		{
			files: ['*.test.ts', '*.test.tsx'],
			env: {
				browser: false,
				node: true,
			},
			plugins: ['@vitest'],
			extends: ['plugin:@vitest/legacy-recommended'],
			rules: {
				'@vitest/no-standalone-expect': [
					'error',
					{ additionalTestBlockFunctions: ['beforeAll', 'beforeEach', 'afterAll', 'afterEach'] },
				],
			},
		},
		{
			files: ['*.config.mts'],
			rules: {
				'@typescript-eslint/no-unsafe-call': 'off',
			},
		},
	],
});
