import styles_animatedcardimage from '@/app/components/cards/animatedcardimage.module.css';
import { CardImage } from '@/app/components/cards/CardImage';
import { scale_height } from '@/app/components/cards/constants';
import { Rank, Suit } from '@/game/card/card';

export function AnimatedCardImage({
	hidden,
	rank,
	suit,
	width,
	enabled = false,
}: Readonly<{
	hidden?: boolean;
	rank: Rank;
	suit: Suit;
	width: number;
	enabled?: boolean; // FIXME swap this out for a different trigger
}>) {
	const cardImage = <CardImage rank={rank} suit={suit} hidden={hidden} width={width} />;
	if (!enabled) return cardImage;
	const height = scale_height(width);
	return (
		<>
			{cardImage}
			<div
				className={styles_animatedcardimage.lens_wrapper}
				style={{ width, height: width, top: `-${height.toFixed(0)}px` }}
			>
				<div className={styles_animatedcardimage.lens_center} />
				<div className={styles_animatedcardimage.lens_circle_1} />
				<div className={styles_animatedcardimage.lens_circle_2} />
			</div>
		</>
	);
}
