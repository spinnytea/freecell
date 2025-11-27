import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap/all';
import { WIN_TEXT_ANIMATION_DURATION, WIN_TEXT_COLOR_DURATION } from '@/app/animation_constants';
import styles_gameboard from '@/app/gameboard.module.css';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

const toHSL = ({ h, s, l }: { h: number; s: number; l: number }) =>
	`hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
const toGradient = (a: string, b: string) => `linear-gradient(to right, ${a}, ${b})`;

export function WinMessage() {
	const elementRef = useRef<HTMLDivElement | null>(null);
	const { win, winIsFlourish } = useGame();
	const fixtureSizes = useFixtureSizes();

	useGSAP(
		() => {
			if (win) {
				// TODO (settings) (reduced-motion) - only animate scale (not X, not Y, not color)
				const prop = gsap.utils.random(['scale', 'scaleX', 'scaleY']);
				gsap.from(elementRef.current, {
					[prop]: 0,
					duration: WIN_TEXT_ANIMATION_DURATION,
					ease: 'power1.out',
				});

				if (winIsFlourish) {
					// TODO (4-priority) (animation) (flourish-anim) 52-card flourish cycles color forever
					//  - basically, disable s/l and repeat h
					// animate color hue, to white
					// TODO (4-priority) (animation) "you win" animation should start after the cards finish moving?
					//  - Or at least during the last one and after the auto-foundation
					//  - we may need a useContext so we can use a single global timeline
					//  - and then never use gsap directly, always add it to a timeline
					//  - maybe we need a wrapper around gsap
					// TODO (4-priority) (animation) (hud) different messages depending on how you win
					//  - standard: you win!
					//  - flourish: ??
					//  - flourish-52: ??
					//  - fewer than x moves: ?? (needs calibration)
					//  - ---
					//  - messages need to fit on a game board
					//  - test various sizes
					//  - each of these should also have an animation
					const color = { h: 0, s: 100, l: 44 }; /* #df0000 */
					const applyColor: gsap.Callback = () => {
						if (elementRef.current) {
							elementRef.current.style.background = toGradient(
								toHSL(color),
								toHSL({ ...color, h: color.h + 135 })
							);
							elementRef.current.style.backgroundClip = 'text';
						}
					};
					gsap.set(elementRef.current, { backgroundClip: 'text', color: 'transparent' });
					gsap.to(color, {
						h: 360,
						onUpdate: applyColor,
						duration: WIN_TEXT_COLOR_DURATION,
						ease: 'none',
					});
					gsap.to(color, {
						s: 0,
						l: 90,
						onUpdate: applyColor,
						duration: WIN_TEXT_COLOR_DURATION,
						ease: 'power3.in',
					});
				}
			}
		},
		{ dependencies: [win, winIsFlourish] }
	);

	if (!win) return null;

	const style = {
		top: fixtureSizes.tableau.top + fixtureSizes.cardHeight + fixtureSizes.cardWidth / 4,
		fontSize: fixtureSizes.cardWidth,
	};

	return (
		<div className={styles_gameboard.winmessage} ref={elementRef} style={style}>
			You Win!
		</div>
	);
}
