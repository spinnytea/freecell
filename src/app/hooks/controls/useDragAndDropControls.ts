import { MutableRefObject, useContext } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import { DEFAULT_TRANSLATE_DURATION } from '@/app/animation_constants';
import { CardLocation } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { calcTopLeftZ } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { useFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/useFixtureSizes';
import { GameContext } from '@/app/hooks/contexts/Game/GameContext';

/**
	calc the new game state at drag start and drag end \
	this helps avoid animations simply by pressing on a card (it's weird to have it move out from under you)

	FIXME i'm still not sure splitting the state update is the right way to go

	this probably won't change, but it is used twice and we _need_ it to be identical
*/
function calcNextState(game: FreeCell, location: CardLocation) {
	return game.clearSelection().setCursor(location).touch();
}

export function useDragAndDropControls(
	cardRef: MutableRefObject<HTMLDivElement | null>,
	location: CardLocation
) {
	const [game, setGame] = useContext(GameContext);
	const fixtureSizes = useFixtureSizes();
	const { top, left, zIndex } = calcTopLeftZ(fixtureSizes, location, game.selection);

	useGSAP(
		(context, contextSafe) => {
			// FIXME (techdebt) (drag-and-drop) use or remove
			// FIXME move to animSomething
			if (cardRef.current && contextSafe) {
				const checkIfValid = contextSafe((draggable: Draggable, event: PointerEvent) => {
					setGame((g) => {
						const ng = calcNextState(g, location);
						if (!ng.selection || ng.selection.peekOnly) {
							// FIXME add a ng.selection.couldMove or something
							// - if (ng.selection?.couldMove) {}
							draggable.endDrag(event);
							return ng;
						}
						return g.clearSelection();
					});
				});

				// FIXME drag whole selection

				const resetAfterDrag = contextSafe(() => {
					// FIXME detect drop target
					// FIXME availableMoves; cards vs columns
					setGame((g) => calcNextState(g, location));

					// FIXME these top/left are stale if we just click but don't drag; but it's fine if we click and drag
					gsap.to(cardRef.current, {
						top,
						left,
						zIndex,
						transform: 'translate3d(0px, 0px, 0px)',
						duration: DEFAULT_TRANSLATE_DURATION,
						ease: 'power1.out',
					});
				}) as React.MouseEventHandler;
				Draggable.create(cardRef.current, {
					zIndexBoost: false,
					onPress: function (event: PointerEvent) {
						checkIfValid(this as Draggable, event);
					},
					onDragEnd: resetAfterDrag,
				});
			}
		},
		{ dependencies: [location] }
	);
}
