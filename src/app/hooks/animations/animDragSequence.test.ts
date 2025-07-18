import { animDragSequence } from '@/app/hooks/animations/animDragSequence';

describe('animDragSequence', () => {
	// the "second card" is lagging way behind the dragged card
	// but the rest of them follow nicely
	// so we need a "fn - C" to bring that down
	// `Math.log` and `b` made this necessary
	// `Math.log2` and `b=2` make `a=c`
	test('fn - c', () => {
		// sync with regular calc; except index off by 1 and no minusC
		const a = 0.06;
		const b = 2;
		const calcDuration = (index: number) => a * Math.log2(index + b);
		const c = calcDuration(0);
		expect(c).toBe(0.06);

		// copy it into regular calc
		// prove we get the same result
		expect(animDragSequence.calcDuration(0)).toBe(0);
		// (see, indexes are off by 1)
		expect(animDragSequence.calcDuration(1)).toBe(calcDuration(1) - c);
		expect(animDragSequence.calcDuration(2)).toBe(calcDuration(2) - c);
		expect(animDragSequence.calcDuration(3)).toBe(calcDuration(3) - c);

		// spot check values
		const values: number[] = [];
		for (let i = 0; i < 13; i++) {
			values[i] = animDragSequence.calcDuration(i);
		}
		expect(values).toMatchSnapshot();
	});
});
