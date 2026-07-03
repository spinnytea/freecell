import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html'],
		},
		alias: {
			// This forces '@/' to resolve exactly to your './src/' folder
			'@': path.resolve(__dirname, './src'),
		},
	},
});
