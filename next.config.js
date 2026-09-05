const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: '/freecell',
	distDir: 'out/freecell',
	output: 'export',
	trailingSlash: true,
	env: {
		VERSION: packageJson.version,
		BASE_PATH: '/freecell',
	},
	eslint: {
		// HACK (techdebt) disable next lint during build
		// package.json build will require eslint before we get to the build step
		// nextjs does not support flat config
		ignoreDuringBuilds: true,
	},
};

module.exports = nextConfig;
