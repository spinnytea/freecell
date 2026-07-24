const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs').promises;
const path = require('path');

const dir = path.join(__dirname, '..', 'public');
const inputSvg = path.join(dir, 'favicon.svg');
const outputIco = path.join(dir, 'favicon.ico');

// Traditional ICO File, Modern Web and Mobile Icons
const faviconSizes = [16, 32, 180, 192, 256, 512];
// transparent
const background = { r: 0, g: 0, b: 0, alpha: 0 };

async function generateFavicon() {
	try {
		const pipeline = sharp(inputSvg);

		for (const size of faviconSizes) {
			const outputPng = path.join(dir, `favicon-${size}x${size}.png`);
			await pipeline.clone().resize(size, size, { background }).png().toFile(outputPng);
			console.log(`Successfully generated ${outputPng}`);
		}

		// generate optimized image buffers for each target size
		const icoBuffers = await Promise.all(
			faviconSizes
				.filter((size) => size <= 256)
				.map((size) => pipeline.clone().resize(size, size, { background }).toBuffer())
		);

		// bundle and save
		const icoBuffer = await toIco(icoBuffers);
		await fs.writeFile(outputIco, icoBuffer);

		console.log('Successfully generated multi-size favicon.ico');
	} catch (error) {
		console.error('Failed to bundle favicon.ico:', error);
	}
}

generateFavicon();
