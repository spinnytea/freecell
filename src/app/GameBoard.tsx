import { useRef } from 'react';
import { CardsOnBoard } from '@/app/components/CardsOnBoard';
import { DebugCursors } from '@/app/components/DebugCursors';
import { KeyboardCursor } from '@/app/components/KeyboardCursor';
import { PileMarkers } from '@/app/components/PileMarkers';
import { StatusBar } from '@/app/components/StatusBar';
import { TextBoard } from '@/app/components/TextBoard';
import { UndoButton } from '@/app/components/UndoButton';
import { WinMessage } from '@/app/components/WinMessage';
import { FixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContextProvider';
import { useSettings } from '@/app/hooks/contexts/Settings/useSettings';
import { useKeybaordArrowControls } from '@/app/hooks/controls/useKeybaordArrowControls';
import { useKeybaordMiscControls } from '@/app/hooks/controls/useKeybaordMiscControls';
import { useNewGameClick } from '@/app/hooks/controls/useNewGameClick';

interface GameBoardDisplayOptions {
	showUndoButton?: boolean;
	showStatusBar?: boolean;
	showTextBoard?: boolean;
	showDebugCursors?: boolean;
}

export default function GameBoard({
	className,
	displayOptions = {},
}: {
	className: string;
	displayOptions?: GameBoardDisplayOptions;
}) {
	useKeybaordMiscControls();
	useKeybaordArrowControls();
	const handleNewGameClick = useNewGameClick();
	const gameBoardRef = useRef<HTMLElement | null>(null);

	return (
		<main ref={gameBoardRef} className={className} onClick={handleNewGameClick}>
			<FixtureSizesContextProvider gameBoardRef={gameBoardRef}>
				<BoardLayout displayOptions={displayOptions} />
			</FixtureSizesContextProvider>
		</main>
	);
}

function BoardLayout({
	displayOptions: { showUndoButton, showStatusBar, showTextBoard, showDebugCursors },
}: {
	displayOptions: GameBoardDisplayOptions;
}) {
	const settings = useSettings();

	// if we pass in a display option, respect that
	// if we do not pass in a display option, fall back to defaults / settings
	if (showUndoButton === undefined) showUndoButton = true;
	if (showStatusBar === undefined) showStatusBar = true;
	if (showTextBoard === undefined) showTextBoard = settings.showDebugInfo;
	if (showDebugCursors === undefined) showDebugCursors = settings.showDebugInfo;

	return (
		<>
			<PileMarkers />
			<WinMessage />
			{settings.showKeyboardCursor && <KeyboardCursor />}
			<CardsOnBoard />
			{!!showUndoButton && <UndoButton />}
			{!!showStatusBar && <StatusBar />}

			{!!showTextBoard && <TextBoard />}
			{!!showDebugCursors && <DebugCursors />}
		</>
	);
}
