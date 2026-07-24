const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs').promises;
const path = require('path');

const inputFile = path.join(__dirname, '..', 'public', 'favicon.svg');
const outputFile = path.join(__dirname, '..', 'public', 'favicon.ico');

// Traditional ICO File, Modern Web and Mobile Icons
const faviconSizes = [16, 32, 48, 180, 192, 256];

async function generateFavicon() {
	try {
		const pipeline = sharp(inputFile);

		// generate optimized image buffers for each target size
		const resizedBuffers = await Promise.all(
			faviconSizes.map((size) =>
				pipeline
					.clone()
					.resize(size, size, {
						fit: 'contain',
						background: { r: 0, g: 0, b: 0, alpha: 0 },
					})
					.toBuffer()
			)
		);

		// bundle and save
		const icoBuffer = await toIco(resizedBuffers);
		await fs.writeFile(outputFile, icoBuffer);

		console.log('Successfully generated multi-size favicon.ico');
	} catch (error) {
		console.error('Failed to bundle favicon.ico:', error);
	}
}

generateFavicon();
