import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	plugins: [react()],
	test: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'server-only': path.resolve(__dirname, './__mocks__/empty.js'),

			// Mocking static assets and styles:
			// Vitest bypasses CSS modules natively, but to maintain your strict mock outputs:
			'^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
			'^.+\\.(css|sass|scss)$': path.resolve(__dirname, './__mocks__/styleMock.js'),
			'^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': path.resolve(
				__dirname,
				'./__mocks__/fileMock.js'
			),
		},
		clearMocks: true,
		restoreMocks: true,
		coverage: {
			provider: 'v8',
			reporter: ['lcov'],
			reportsDirectory: 'coverage',
			include: ['**/*.{js,jsx,ts,tsx}'],
			exclude: [
				'__mocks__/**',
				'src/app/game/catalog/*.ts',
				'**/*.d.ts',
				'**/node_modules/**',
				'out/**',
				'.next/**',
				'*.config.js',
				'coverage/**',
			],
		},
		css: {
			modules: {
				classNameStrategy: 'non-scoped', // Forces class names to output cleanly as raw string literals
			},
		},
		environment: 'jsdom',
		exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
		reporters: ['default', './src/ActionTextReporter.mts'],
		setupFiles: ['./src/app/test_mocks.ts'],
	},
});
