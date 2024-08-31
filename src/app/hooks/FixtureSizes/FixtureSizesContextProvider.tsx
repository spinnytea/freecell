import { MutableRefObject, ReactNode, useEffect, useState } from 'react';
import {
	calcFixtureSizes,
	DEFAULT_CLIENT_HEIGHT,
	DEFAULT_CLIENT_WIDTH,
	FixtureSizes,
} from '@/app/hooks/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/FixtureSizes/FixtureSizesContext';

export function FixtureSizesContextProvider({
	gameBoardRef,
	children,
}: {
	gameBoardRef: MutableRefObject<HTMLElement | null>;
	children: ReactNode;
}) {
	const [fixtureSizes, setFixtureSizes] = useState<FixtureSizes | null>(null);

	useEffect(() => {
		function updateSize() {
			const screenWidth = gameBoardRef.current?.offsetWidth ?? DEFAULT_CLIENT_WIDTH;
			const screenHeight = gameBoardRef.current?.offsetHeight ?? DEFAULT_CLIENT_HEIGHT;
			setFixtureSizes((fs) => {
				if (!fs || fs.boardWidth !== screenWidth || fs.boardHeight !== screenHeight) {
					return calcFixtureSizes(screenWidth, screenHeight);
				}
				return fs;
			});
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [gameBoardRef]);

	// wait until we have an actual value init
	if (!fixtureSizes) {
		return null;
	}

	return (
		<FixtureSizesContext.Provider value={fixtureSizes}>{children}</FixtureSizesContext.Provider>
	);
}
