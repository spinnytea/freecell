import { MutableRefObject, ReactNode, useEffect, useState } from 'react';
import {
	calcFixtureSizes,
	DEFAULT_CLIENT_HEIGHT,
	DEFAULT_CLIENT_WIDTH,
	FixtureLayout,
	FixtureSizes,
} from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContext';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

export function FixtureSizesContextProvider({
	gameBoardRef,
	fixtureLayout,
	children,
}: Readonly<{
	gameBoardRef: MutableRefObject<HTMLElement | null>;
	fixtureLayout?: FixtureLayout;
	children: ReactNode;
}>) {
	const game = useGame();
	const cellCount = game.cells.length;
	const cascadeCount = game.tableau.length;
	const [fixtureSizes, setFixtureSizes] = useState<FixtureSizes | null>(null);

	useEffect(() => {
		function updateSize() {
			const screenWidth = gameBoardRef.current?.offsetWidth ?? DEFAULT_CLIENT_WIDTH;
			const screenHeight = gameBoardRef.current?.offsetHeight ?? DEFAULT_CLIENT_HEIGHT;
			setFixtureSizes((fs) => {
				if (!fs || fs.boardWidth !== screenWidth || fs.boardHeight !== screenHeight) {
					return calcFixtureSizes({
						boardWidth: screenWidth,
						boardHeight: screenHeight,
						cellCount,
						cascadeCount,
						fixtureLayout,
					});
				}
				return fs;
			});
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [gameBoardRef, cellCount, cascadeCount, fixtureLayout]);

	// wait until we have an actual value init
	if (!fixtureSizes) {
		return null;
	}

	return (
		<FixtureSizesContext.Provider value={fixtureSizes}>{children}</FixtureSizesContext.Provider>
	);
}
