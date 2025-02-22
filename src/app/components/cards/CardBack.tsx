import Image from 'next/image';
import { ASSET_FOLDER } from '@/app/components/cards/constants';

// TODO (theme) alternate card backs?
// TODO (hud) (2-priority) Airplane mode: no deck?
// - Does it check for it every time? seems so
// - Do we need to place an invisible one / off screen so it's always loaded?
// - smol cards are available offline, they are part of the code
// - large cards could fall back to smol cards
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
