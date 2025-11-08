import { ReactNode } from 'react';
import { FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContext';
import { useGame } from '@/app/hooks/contexts/Game/useGame';

export function StaticFixtureSizesContextProvider({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	const { cells, foundations, tableau } = useGame();
	const cellCount = cells.length;
	const foundationCount = foundations.length;
	const cascadeCount = tableau.length;

	const fixtureSizes = calcStaticFixtureSizes(cellCount, foundationCount, cascadeCount);

	return (
		<FixtureSizesContext.Provider value={fixtureSizes}>{children}</FixtureSizesContext.Provider>
	);
}

export function calcStaticFixtureSizes(
	cellCount: number,
	foundationCount: number,
	cascadeCount: number
): FixtureSizes {
	const cellLeft = Array.from({ length: cellCount }, (_, index) => (index + 1) * 10);
	const foundationLeft = Array.from(
		{ length: foundationCount },
		(_, index) => (index + 1 + cellCount) * 10
	);
	const cascadeLeft = Array.from({ length: cascadeCount }, (_, index) => (index + 1) * 10);
	return {
		existsFixtureSizes: true,

		boardWidth: Math.max(cellCount + foundationCount, cascadeCount) * 10 + 20,
		boardHeight: 100,
		cardWidth: 10,
		cardHeight: 20,

		home: {
			top: 5,
			cellLeft,
			foundationLeft,
		},

		tableau: {
			top: 20,
			cascadeLeft,
			offsetTop: 1,
		},

		deck: {
			top: 90,
			left: 10,
		},
	};
}
