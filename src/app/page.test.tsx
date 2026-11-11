import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { beforeEach, describe, expect, type Mock, test, vi } from 'vitest';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import Page from '@/app/page';
import { collectSetSpyGroups, getPropertiesFromFromToSpy, getPropertiesFromSpy, spyOnGsap } from '@/app/testUtils';
import { utils } from '@/utils';

describe('page', () => {
	let fromToSpy: Mock;
	let setSpy: Mock;
	let toSpy: Mock;
	let addLabelSpy: Mock;
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	let randomIntegerSpy: Mock;
	beforeEach(() => {
		({ fromToSpy, setSpy, toSpy, addLabelSpy, mockCallTimes, mockReset } = spyOnGsap(gsap));
		randomIntegerSpy = vi.spyOn(utils, 'randomInteger').mockImplementation(() => {
			throw new Error('you MUST mock utils.randomInteger');
		});
	});

	test('should render without crashing', () => {
		randomIntegerSpy.mockReturnValueOnce(5); // seed for shuffle
		render(
			<ErrorBoundary>
				<Page />
			</ErrorBoundary>
		);
		expect(screen.queryAllByAltText('card back').length).toBe(52);
		expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (5)'], ['updateCardPositions']]);
		expect(mockCallTimes()).toEqual({
			gsapSetSpy: 52,
			setSpy: 52,
			addLabelSpy: 2,
		});
		// XXX (test) gsapSetSpy
		// XXX (test) setSpy

		mockReset(true);
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		expect(addLabelSpy.mock.calls).toEqual([['gameFunction check-can-flourish'], ['updateCardPositions']]);
		expect(mockCallTimes()).toEqual({
			fromToSpy: 52,
			setSpy: 104, // FIXME should be 52
			toSpy: 2,
			addLabelSpy: 2,
		});
		expect(getPropertiesFromFromToSpy(fromToSpy)).toEqual({
			from: {
				top: 52,
				left: 52,
			},
			to: {
				top: 52,
				left: 52,
			},
		});
		expect(collectSetSpyGroups(setSpy)).toEqual([['zIndex']]);
		expect(getPropertiesFromSpy(toSpy)).toEqual({
			rotation: 2,
		});

		expect(screen.queryAllByAltText('card back').length).toBe(0);
		expect(screen.getByText('king of hearts')).toBeTruthy();
		expect(randomIntegerSpy.mock.calls).toEqual([[32000]]); // just one shuffle
	});
});
