import { useRef } from 'react';
import { CardsOnBoard } from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { KeyboardCursor } from '@/app/components/KeyboardCursor';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { UndoButton } from '@/app/components/UndoButton';
import { WinMessage } from '@/app/components/WinMessage';
import styles_gameboard from '@/app/gameboard.module.css';
import { FixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContextProvider';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useKeybaordArrowControls } from '@/app/hooks/controls/useKeybaordArrowControls';
import { useKeybaordMiscControls } from '@/app/hooks/controls/useKeybaordMiscControls';
import { useNewGameClick } from '@/app/hooks/controls/useNewGameClick';

export default function GameBoard() {
	useKeybaordMiscControls();
	useKeybaordArrowControls();
	const handleNewGameClick = useNewGameClick();
	const gameBoardRef = useRef<HTMLElement | null>(null);

	return (
		<main ref={gameBoardRef} className={styles_gameboard.main} onClick={handleNewGameClick}>
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
			{settings.showKeyboardCursor && <KeyboardCursor />}
			<CardsOnBoard />
			<UndoButton />
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
