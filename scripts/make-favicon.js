const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs').promises;
const path = require('path');

// Use this to recreate the suite of favicons
//  - `favicon.svg` is the official actual icon all others come from
//    ↪ favicon.ico
//  - `maskable.svg` is ... a duplicate, adjusted to fit inside a circle
//    ↪ maskable-size.png

const dir = path.join(__dirname, '..', 'public');
const squareSvg = path.join(dir, 'favicon.svg');
const maskableSvg = path.join(dir, 'maskable.svg');
const outputIco = path.join(dir, 'favicon.ico');

const faviconSizes = [16, 32];
const maskableSizes = [180, 512];

async function generateFavicon() {
	try {
		const squarePipeline = sharp(squareSvg);
		const maskablePipeline = sharp(maskableSvg);

		// for (const size of faviconSizes) {
		// 	const outputPng = path.join(dir, `favicon-${size}x${size}.png`);
		// 	await squarePipeline.clone().resize(size, size).png().toFile(outputPng);
		// 	console.log(`Successfully generated ${outputPng}`);
		// }

		for (const size of maskableSizes) {
			const outputPng = path.join(dir, `maskable-${size}x${size}.png`);
			await maskablePipeline.clone().resize(size, size).png().toFile(outputPng);
			console.log(`Successfully generated ${outputPng}`);
		}

		// generate optimized image buffers for each target size
		const icoBuffers = await Promise.all(
			faviconSizes.map((size) => squarePipeline.clone().resize(size, size).toBuffer())
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
