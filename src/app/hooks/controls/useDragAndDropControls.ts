import { MutableRefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { Draggable, gsap } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION } from '@/app/animation_constants';

export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	top: number,
	left: number,
	zIndex: number
) {
	useGSAP(
		(context, contextSafe) => {
			// FIXME (techdebt) (drag-and-drop) use or remove
			// FIXME move to animSomething
			if (cardRef.current && contextSafe) {
				const resetAfterDrag = contextSafe(() => {
					// FIXME only allow dragging whole selection !peekOnly
					// FIXME transform feels like a hack
					// FIXME this top/left/zIndex is for the initial page load, not the updated values of the game
					// FIXME detect drop target
					gsap.to(cardRef.current, {
						top,
						left,
						zIndex,
						transform: 'translate3d(0px, 0px, 0px)',
						duration: DEFAULT_TRANSLATE_DURATION,
						ease: 'power1.out',
					});
				});
				Draggable.create(cardRef.current, {
					zIndexBoost: false,
					onDragEnd: resetAfterDrag,
				});
			}
		},
		{ dependencies: [] }
	);
}
