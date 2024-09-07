const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',
	env: {
		version: packageJson.version,
	},
};

module.exports = nextConfig;
