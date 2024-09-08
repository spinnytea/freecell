const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: '/freecell',
	distDir: 'out/freecell',
	output: 'export',
	env: {
		VERSION: packageJson.version,
		BASE_PATH: '/freecell',
	},
};

module.exports = nextConfig;
