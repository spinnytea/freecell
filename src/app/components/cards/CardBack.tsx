import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';

// TODO (theme) alternate card backs?
export function CardBack({
	width,
	height,
}: Readonly<{
	width: number;
	height: number;
}>) {
	const filename = getFilename();
	return (
		<Image
			src={filename}
			alt="card back"
			width={Math.floor(width)}
			height={height}
			draggable={false}
			priority
		/>
	);
}

function getFilename() {
	return `${ASSET_FOLDER}/i/Card_back_10.svg`;
}
