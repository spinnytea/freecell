import { useContext, useEffect, useRef } from 'react';
import { CardsOnBoard } from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { KeyboardCursor } from '@/app/components/KeyboardCursor';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { WinMessage } from '@/app/components/WinMessage';
import { FreeCell } from '@/app/game/game';
import styles_gameboard from '@/app/gameboard.module.css';
import { FixtureSizesContextProvider } from '@/app/hooks/FixtureSizes/FixtureSizesContextProvider';
import { GameContext } from '@/app/hooks/Game/GameContext';
import { useSettings } from '@/app/hooks/Settings/useSettings';

// FIXME split out controls
export default function GameBoard() {
	const gameBoardRef = useRef<HTMLElement | null>(null);
	const [game, setGame] = useContext(GameContext);

	/** @deprecated just for getting started */
	function handleClick() {
		if (game.win) {
			// click to reset
			setGame(new FreeCell().shuffle32());
		} else if (game.deck.length) {
			// click to deal
			setGame(game.dealAll());
		}
	}

	/** @deprecated just for getting started */
	useEffect(() => {
		function handleKey(event: KeyboardEvent) {
			const { key } = event;
			let consumed = false;
			switch (key) {
				case 'ArrowLeft':
					consumed = true;
					setGame((g) => g.moveCursor('left'));
					break;
				case 'ArrowRight':
					consumed = true;
					setGame((g) => g.moveCursor('right'));
					break;
				case 'ArrowUp':
					consumed = true;
					setGame((g) => g.moveCursor('up'));
					break;
				case 'ArrowDown':
					consumed = true;
					setGame((g) => g.moveCursor('down'));
					break;
				case ' ':
				case 'Enter':
					consumed = true;
					setGame((g) => {
						if (g.cursor.fixture === 'deck') {
							return g.dealAll();
						}
						if (g.cursor.fixture === 'foundation' && g.win) {
							return new FreeCell().shuffle32();
						}
						return g.touch().autoFoundationAll();
					});
					break;
				case 'Escape':
					consumed = true;
					setGame((g) => g.clearSelection());
					break;
				// default:
				// 	console.log(`unused key: "${key}"`);
				// 	break;
			}
			if (consumed) {
				event.stopPropagation();
			}
		}

		window.addEventListener('keydown', handleKey);
		return () => {
			window.removeEventListener('keydown', handleKey);
		};
	}, [setGame]);

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main} onClick={handleClick}>
			<FixtureSizesContextProvider gameBoardRef={gameBoardRef}>
				<BoardLayout />
			</FixtureSizesContextProvider>
		</main>
	);
}

function BoardLayout() {
	const settings = useSettings();

	return (
		<>
			<PileMarkers />
			<WinMessage />
			<KeyboardCursor />
			<CardsOnBoard />
			<StatusBar />

			{settings.showDebugInfo && (
				<>
					<TextBoard />
					<DebugCursors />
				</>
			)}
		</>
	);
}
