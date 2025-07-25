import { render } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { domUtils } from '@/app/components/element/domUtils';
import { useCardPositionAnimations } from '@/app/hooks/animations/useCardPositionAnimations';
import { FixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContextProvider';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import { ManualTestingSettingsContextProvider } from '@/app/hooks/contexts/Settings/ManualTestingSettingsContextProvider';
import { spyOnGsap } from '@/app/testUtils';
import {
	ACTION_TEXT_EXAMPLES,
	FIFTY_TWO_CARD_FLOURISH,
	pullActionTextExamples,
} from '@/game/catalog/actionText-examples';
import { FreeCell } from '@/game/game';

jest.mock('@/app/components/element/domUtils.ts', () => {
	const domTLZ = new Map<string, { top: number; left: number; zIndex: number }>();
	return {
		domUtils: {
			domTLZ,
			getDomAttributes: (cardId: string) => {
				return domTLZ.get(cardId);
			},
			setDomAttributes: (cardId: string, tlz: { top: number; left: number; zIndex: number }) => {
				domTLZ.set(cardId, tlz);
			},
		},
	};
});

function MockGamePage({ games }: { games: (FreeCell | string)[] }) {
	return (
		<StaticGameContextProvider games={games}>
			<FixtureSizesContextProvider gameBoardRef={{ current: null }} fixtureLayout="portrait">
				<ManualTestingSettingsContextProvider>
					<MockGameBoard />
				</ManualTestingSettingsContextProvider>
			</FixtureSizesContextProvider>
		</StaticGameContextProvider>
	);
}

function MockGameBoard() {
	useCardPositionAnimations();
	return null;
}

describe('useCardPositionAnimations', () => {
	// we can use this for a lot of tests, so we don't need to keep remaking it
	const newGameState = new FreeCell();

	// REVIEW (techdebt) this is a _lot_ of mocking, can we make some accessors to simplify this?
	let fromToSpy: jest.SpyInstance;
	let toSpy: jest.SpyInstance;
	let setSpy: jest.SpyInstance;
	let addLabelSpy: jest.SpyInstance;
	let consoleDebugSpy: jest.SpyInstance;
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	beforeEach(() => {
		domUtils.domTLZ.clear();

		({ fromToSpy, toSpy, setSpy, addLabelSpy, consoleDebugSpy, mockReset, mockCallTimes } =
			spyOnGsap(gsap));
	});

	function getCardIdsFromSpy(spy: jest.SpyInstance) {
		return spy.mock.calls.map(([cardIdSelector]: [string]) => cardIdSelector);
	}

	test.todo('change fixtureSizes');

	// REVIEW (animation) all of (each PreviousActionType) should be on manualtesting/page
	describe('game (each PreviousActionType)', () => {
		describe('init', () => {
			test('undefined -> init', () => {
				const gameStateOne = newGameState;
				const gameStateTwo = gameStateOne;
				expect(gameStateTwo.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});

				const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				expect(setSpy.mock.calls).toMatchSnapshot();
				// expect(setSpy.mock.calls.map(([cardIdSelector]) => cardIdSelector as string)).toEqual(['#cAC', '#cAD', ..., '#cKH', '#cKS']);
				expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 0,
					toSpy: 0,
					setSpy: 52,
					addLabelSpy: 1,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});

				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 0,
					toSpy: 0,
					setSpy: 0,
					addLabelSpy: 0,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
			});

			test('win -> init', () => {
				const gameStateOne =
					'>            KC KD KH KS \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' hand-jammed';
				const gameStateTwo = newGameState;
				expect(gameStateTwo.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});

				const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 52,
					toSpy: 52,
					setSpy: 0,
					addLabelSpy: 1,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
				// TODO (animation) (techdebt) isn't this backwards?
				//  - shouldn't kings be first?
				expect(toSpy.mock.calls[0]).toEqual([
					'#cAC',
					{ duration: 0.15, ease: 'none', zIndex: 0 },
					'<',
				]);
				expect(fromToSpy.mock.calls[0]).toEqual([
					'#cAC',
					{ top: 36.6, left: 428.07 },
					{ top: 441.4, left: 14.035, duration: 0.3, ease: 'power1.out' },
					'>0',
				]);
				expect(fromToSpy.mock.calls[1]).toEqual([
					'#cAD',
					{ top: 36.6, left: 519.298 },
					{ top: 441.4, left: 14.035, duration: 0.3, ease: 'power1.out' },
					'<0.006',
				]);
				expect(fromToSpy.mock.calls[51]).toEqual([
					'#cKS',
					{ top: 36.6, left: 701.754 },
					{ top: 441.4, left: 14.035, duration: 0.3, ease: 'power1.out' },
					'<0.006',
				]);
				expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
			});

			// we (read: _i_) very often win a game then set it aside
			// after coming back later, maybe react has dropped the previous TLs
			//
			test.todo('win -> undefined init');
		});

		test('shuffle', () => {
			const gameStateOne = newGameState;
			const gameStateTwo = gameStateOne.shuffle32(5);
			expect(gameStateTwo.previousAction).toEqual({
				text: 'shuffle deck (5)',
				type: 'shuffle',
			});

			const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
			mockReset();
			rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

			expect(mockCallTimes()).toEqual({
				toGsapSpy: 0,
				setGsapSpy: 0,
				fromGsapSpy: 0,
				fromToSpy: 0,
				toSpy: 4,
				setSpy: 2,
				addLabelSpy: 1,
				addSpy: 2,
				timeScaleSpy: 0,
				consoleDebugSpy: 0,
			});
			expect(toSpy.mock.calls[0]).toEqual([
				'#cAD',
				{ x: '-=8', y: '-=25', rotation: '-=8', duration: 0.15, ease: 'sine.out' },
			]);
			expect(toSpy.mock.calls[1]).toEqual([
				'#cAD',
				{ x: '0', y: '0', rotation: 0, duration: 0.15, ease: 'sine.in' },
			]);
			expect(toSpy.mock.calls[2]).toEqual([
				'#cAH',
				{ x: '+=8', y: '-=25', rotation: '+=8', duration: 0.15, ease: 'sine.in' },
			]);
			expect(toSpy.mock.calls[3]).toEqual([
				'#cAH',
				{ x: '0', y: '0', rotation: 0, duration: 0.15, ease: 'sine.out' },
			]);
			expect(setSpy.mock.calls[0]).toEqual(['#cAD', { zIndex: -100 }]);
			expect(setSpy.mock.calls[1]).toEqual(['#cAH', { zIndex: -99 }]);
			expect(addLabelSpy.mock.calls).toEqual([['shuffle']]);
		});

		test('deal', () => {
			const gameStateOne = newGameState;
			const gameStateTwo = gameStateOne.dealAll();
			expect(gameStateTwo.previousAction).toEqual({
				text: 'deal all cards',
				type: 'deal',
			});

			const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
			mockReset(false);
			consoleDebugSpy.mockReturnValueOnce(undefined);
			rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

			expect(mockCallTimes()).toEqual({
				toGsapSpy: 0,
				setGsapSpy: 0,
				fromGsapSpy: 0,
				fromToSpy: 52,
				toSpy: 52,
				setSpy: 0,
				addLabelSpy: 1,
				addSpy: 0,
				timeScaleSpy: 1,
				consoleDebugSpy: 1,
			});
			expect(toSpy.mock.calls[0]).toEqual([
				'#cQC',
				{ duration: 0.15, ease: 'none', zIndex: 0 },
				'<',
			]);
			expect(toSpy.mock.calls[51]).toEqual([
				'#cAS',
				{ duration: 0.15, ease: 'none', zIndex: 6 },
				'<',
			]);
			expect(fromToSpy.mock.calls[0]).toEqual([
				'#cQC',
				{ top: 441.4, left: 14.035 },
				{ top: 195.2, left: 701.754, duration: 0.3, ease: 'power1.out' },
				'>0',
			]);
			expect(fromToSpy.mock.calls[1]).toEqual([
				'#cQD',
				{ top: 441.4, left: 14.035 },
				{ top: 195.2, left: 603.509, duration: 0.3, ease: 'power1.out' },
				'<0.006',
			]);
			expect(fromToSpy.mock.calls[51]).toEqual([
				'#cAS',
				{ top: 441.4, left: 14.035 },
				{ top: 341.6, left: 14.035, duration: 0.3, ease: 'power1.out' },
				'<0.006',
			]);
			expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'deal']]);
		});

		test('cursor', () => {
			const gameStateOne = newGameState.dealAll().moveCursor('down');
			const gameStateTwo = gameStateOne.moveCursor('right');
			expect(gameStateTwo.previousAction).toEqual({
				text: 'cursor right',
				type: 'cursor',
			});

			const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
			mockReset();
			rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

			expect(mockCallTimes()).toEqual({
				toGsapSpy: 0,
				setGsapSpy: 0,
				fromGsapSpy: 0,
				fromToSpy: 0,
				toSpy: 0,
				setSpy: 0,
				addLabelSpy: 0,
				addSpy: 0,
				timeScaleSpy: 0,
				consoleDebugSpy: 0,
			});
		});

		test.todo('select');

		test.todo('deselect');

		test.todo('move');

		describe('move-foundation', () => {
			test('one and one', () => {
				const gameStateOne = new FreeCell().shuffle32(5).dealAll();
				const gameStateTwo = gameStateOne.moveByShorthand('53');
				expect(gameStateTwo.previousAction).toEqual({
					text: 'move 53 6H→7C (auto-foundation 2 AD)',
					type: 'move-foundation',
					tweenCards: [
						{ rank: '6', suit: 'hearts', location: { fixture: 'cascade', data: [2, 7] } },
					],
				});

				const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				expect(toSpy.mock.calls).toEqual([
					['#c6H', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
					['#cAD', { zIndex: 99, duration: 0.15, ease: 'none' }, '<'],
				]);
				expect(fromToSpy.mock.calls).toEqual([
					[
						'#c6H',
						{ top: 317.2, left: 407.018 },
						{ top: 366, left: 210.526, duration: 0.3, ease: 'power1.out' },
						'>0',
					],
					[
						'#cAD',
						{ top: 341.6, left: 112.281 },
						{ top: 36.6, left: 428.07, duration: 0.3, ease: 'power1.out' },
						'>0',
					],
				]);
				const setCardIds = getCardIdsFromSpy(setSpy);
				expect(setCardIds.length).toBe(50);
				expect(setCardIds).not.toContain('#cAD'); // 51
				expect(setCardIds).not.toContain('#c6H'); // 52
				expect(addLabelSpy.mock.calls).toEqual([
					['updateCardPositionsPrev'],
					['updateCardPositions'],
				]);
				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 2,
					toSpy: 2,
					setSpy: 50,
					addLabelSpy: 2,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
			});

			test('multiple with overlap', () => {
				const gameStateOne = FreeCell.parse(
					'' + //
						'             QC TD KH TS \n' +
						' KD KC       KS          \n' +
						' QS>QD|                  \n' +
						' JD|JS|                  \n' +
						' select 2 QD-JS'
				);
				const gameStateTwo = gameStateOne.autoMove();
				expect(gameStateTwo.print()).toBe(
					'' + //
						'            >KC KD KH KS \n' +
						'                         \n' +
						':    Y O U   W I N !    :\n' +
						'                         \n' +
						' move 25 QD-JS→KS (auto-foundation 1551215 JD,JS,QD,QS,KC,KD,KS)'
				);
				expect(gameStateTwo.previousAction).toEqual({
					text: 'move 25 QD-JS→KS (auto-foundation 1551215 JD,JS,QD,QS,KC,KD,KS)',
					type: 'move-foundation',
					tweenCards: [
						{ rank: 'queen', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 1] } },
						{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [4, 2] } },
					],
				});

				const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				expect(toSpy.mock.calls).toEqual([
					['#cQD', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
					['#cJS', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
					// and then
					['#cJD', { top: 36.6, left: 519.298, duration: 0.3, ease: 'power1.out' }, '>0.043'],
					['#cJD', { zIndex: 109, duration: 0.15, ease: 'none' }, '<'],
					['#cJS', { top: 36.6, left: 701.754, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cJS', { zIndex: 109, duration: 0.15, ease: 'none' }, '<'],
					['#cQD', { top: 36.6, left: 519.298, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cQD', { zIndex: 110, duration: 0.15, ease: 'none' }, '<'],
					['#cQS', { top: 36.6, left: 701.754, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cQS', { zIndex: 110, duration: 0.15, ease: 'none' }, '<'],
					['#cKC', { top: 36.6, left: 428.07, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cKC', { zIndex: 111, duration: 0.15, ease: 'none' }, '<'],
					['#cKD', { top: 36.6, left: 519.298, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cKD', { zIndex: 111, duration: 0.15, ease: 'none' }, '<'],
					['#cKS', { top: 36.6, left: 701.754, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cKS', { zIndex: 111, duration: 0.15, ease: 'none' }, '<'],
				]);
				expect(fromToSpy.mock.calls).toEqual([
					[
						'#cQD',
						{ top: 213.5, left: 112.281 },
						{ top: 219.6, left: 407.018, duration: 0.3, ease: 'power1.out' },
						'>0',
					],
					[
						'#cJS',
						{ top: 256.2, left: 112.281 },
						{ top: 244, left: 407.018, duration: 0.3, ease: 'power1.out' },
						'<0.060',
					],
				]);
				const setCardIds = getCardIdsFromSpy(setSpy);
				expect(setCardIds.length).toBe(45);
				expect(setCardIds).not.toContain('#cJD'); // 46
				expect(setCardIds).not.toContain('#cJS');
				expect(setCardIds).not.toContain('#cQD');
				expect(setCardIds).not.toContain('#cQS');
				expect(setCardIds).not.toContain('#cKC'); // 50
				expect(setCardIds).not.toContain('#cKD');
				expect(setCardIds).not.toContain('#cKS'); // 52
				expect(addLabelSpy.mock.calls).toEqual([
					['updateCardPositionsPrev'],
					['updateCardPositions'],
				]);
				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 2,
					toSpy: 16,
					setSpy: 45,
					addLabelSpy: 2,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
			});

			/**
				should we animate the AS dip to "deselect" (un peek) with tweenCards

				REVIEW (techdebt) (animation) refactor tweenCards?
				 - the more i review these animations the more i think:
				 - replace tweenCards the _entire_ FreeCell game state
				 - do the animation to the tweenGame
				 - then do the animation to the final game
				---
				 - does that even work in this case since the deselect is masked?
				 - yeah, because we don't need a 3 stage animation
				 - we just want to animate everything to the "final resting state" _and then_ the auto-foundation
			*/
			test('selection goes to foundation', () => {
				const gameStateOne = FreeCell.parse(
					'' + //
						' 4S 7S 2S    AH          \n' +
						' 8D 6C JS 3D 3H    8C 6S \n' +
						' 2H 9S QC 9C 7D    9H JD \n' +
						' 2C AC 5D 5C TS    QH KH \n' +
						' TH 6D 5H 4H TD    AD 6H \n' +
						' 7H 8S KS 3S KC   >AS|3C \n' +
						'    2D KD    QD    8H 4C \n' +
						'    5S QS    JC    7C    \n' +
						'    4D JH                \n' +
						'       TC                \n' +
						'       9D                \n' +
						' select AS'
				);
				expect(gameStateOne.selection).toEqual({
					location: { fixture: 'cascade', data: [6, 4] },
					cards: [{ rank: 'ace', suit: 'spades', location: { fixture: 'cascade', data: [6, 4] } }],
					peekOnly: true,
				});
				const gameStateTwo = gameStateOne.$touchAndMove({ fixture: 'cascade', data: [6, 5] });
				expect(gameStateTwo.previousAction.text).toBe(
					'move 76 8H-7C→cascade (auto-foundation 77c AS,AD,2S)'
				);

				// BUG (techdebt) (animation) (gameplay) finish test
				//  - yes we animate 8H-7C→cascade
				//  - yes we animate auto-foundation 77c AS,AD,2S
				//  - we should animate also deselect AS

				const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				expect(getCardIdsFromSpy(toSpy)).toEqual(['#c8H', '#c7C', '#cAD', '#cAS', '#c2S']);
				expect(getCardIdsFromSpy(fromToSpy)).toEqual(['#c8H', '#c7C', '#cAD', '#cAS', '#c2S']);
				expect(getCardIdsFromSpy(setSpy).length).toBe(47); // 52 - 5
				// TODO (techdebt) verify exactly which cards are missing
				expect(addLabelSpy.mock.calls).toEqual([
					['updateCardPositionsPrev'],
					['updateCardPositions'],
				]);
				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 5,
					toSpy: 5,
					setSpy: 47,
					addLabelSpy: 2,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
			});
		});

		test.todo('move-flourish');

		test.todo('auto-foundation');

		test.todo('auto-flourish');

		describe('invalid', () => {
			let gameStateOne: FreeCell;
			beforeEach(() => {
				gameStateOne = FreeCell.parse(
					'' + //
						' 3C 4C    AC 2D       \n' +
						'>KC TH    KD \n' +
						' QD       QC \n' +
						' JC          \n' +
						' hand-jammed'
				);
			});

			test('game state checks', () => {
				expect(gameStateOne.cells.length).toBe(3);
				expect(gameStateOne.printFoundation()).toBe('AC 2D      ');
				expect(gameStateOne.tableau.length).toBe(4);
			});

			// REVIEW (animation) different animations for each MoveSourceType?
			describe('MoveSourceType', () => {
				test.todo('deck');

				test('cell', () => {
					gameStateOne = gameStateOne.setCursor({ fixture: 'cell', data: [0] }).touch();
					expect(gameStateOne.previousAction.text).toBe('select a 3C');
					const gameStateTwo = gameStateOne.setCursor({ fixture: 'foundation', data: [1] }).touch();
					expect(gameStateTwo.previousAction.text).toBe('invalid move ah 3C→2D');

					const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
					mockReset();
					rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

					// prettier-ignore
					expect(getCardIdsFromSpy(toSpy)).toEqual([
						'#c3C', '#c3C', '#c3C',
						'#c2D', '#c2D', '#c2D',
					]);
					expect(addLabelSpy.mock.calls).toEqual([
						['invalidMoveCards.fromShorthands'],
						['invalidMoveCards.toShorthands'],
					]);
					expect(mockCallTimes()).toEqual({
						toGsapSpy: 0,
						setGsapSpy: 0,
						fromGsapSpy: 0,
						fromToSpy: 0,
						toSpy: 6,
						setSpy: 0,
						addLabelSpy: 2,
						addSpy: 2,
						timeScaleSpy: 0,
						consoleDebugSpy: 0,
					});
				});

				test('foundation', () => {
					gameStateOne = gameStateOne
						.setCursor({ fixture: 'foundation', data: [0] })
						.touch({ allowSelectFoundation: true });
					expect(gameStateOne.previousAction.text).toBe('select AC');
					expect(gameStateOne.selection).toEqual({
						location: { fixture: 'foundation', data: [0] },
						cards: [{ rank: 'ace', suit: 'clubs', location: { fixture: 'foundation', data: [0] } }],
						peekOnly: true,
					});
					const gameStateTwo = gameStateOne.setCursor({ fixture: 'cell', data: [2] }).touch();
					expect(gameStateTwo.previousAction.text).toBe('invalid move hc AC→cell');

					const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
					mockReset(false);
					consoleDebugSpy.mockReturnValueOnce(undefined);
					rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

					// prettier-ignore
					expect(getCardIdsFromSpy(toSpy)).toEqual([
						'#cAC', '#cAC', '#cAC',
					]);
					expect(addLabelSpy.mock.calls).toEqual([['invalidMoveCards.fromShorthands']]);
					expect(consoleDebugSpy.mock.calls).toEqual([['speedup invalidMoveCards', 'invalid']]);
					expect(mockCallTimes()).toEqual({
						toGsapSpy: 0,
						setGsapSpy: 0,
						fromGsapSpy: 0,
						fromToSpy: 0,
						toSpy: 3,
						setSpy: 0,
						addLabelSpy: 1,
						addSpy: 1,
						timeScaleSpy: 1,
						consoleDebugSpy: 1,
					});
				});

				test('cascade:single', () => {
					gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [1, 0] }).touch();
					expect(gameStateOne.previousAction.text).toBe('select 2 TH');
					const gameStateTwo = gameStateOne.setCursor({ fixture: 'foundation', data: [0] }).touch();
					expect(gameStateTwo.previousAction.text).toBe('invalid move 2h TH→AC');

					const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
					mockReset();
					rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

					// prettier-ignore
					expect(getCardIdsFromSpy(toSpy)).toEqual([
						'#cTH', '#cTH', '#cTH',
						'#cAC', '#cAC', '#cAC',
					]);
					expect(addLabelSpy.mock.calls).toEqual([
						['invalidMoveCards.fromShorthands'],
						['invalidMoveCards.toShorthands'],
					]);
					expect(mockCallTimes()).toEqual({
						toGsapSpy: 0,
						setGsapSpy: 0,
						fromGsapSpy: 0,
						fromToSpy: 0,
						toSpy: 6,
						setSpy: 0,
						addLabelSpy: 2,
						addSpy: 2,
						timeScaleSpy: 0,
						consoleDebugSpy: 0,
					});
				});

				test('cascade:sequence', () => {
					gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
					expect(gameStateOne.previousAction.text).toBe('select 1 KC-QD-JC');
					const gameStateTwo = gameStateOne.setCursor({ fixture: 'foundation', data: [1] }).touch();
					expect(gameStateTwo.previousAction.text).toBe('invalid move 1h KC-QD-JC→2D');

					const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
					mockReset();
					rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

					// prettier-ignore
					expect(getCardIdsFromSpy(toSpy)).toEqual([
						'#cKC', '#cKC', '#cKC',
						'#cQD', '#cQD', '#cQD',
						'#cJC', '#cJC', '#cJC',
						'#c2D', '#c2D', '#c2D',
					]);
					expect(addLabelSpy.mock.calls).toEqual([
						['invalidMoveCards.fromShorthands'],
						['invalidMoveCards.toShorthands'],
					]);
					expect(mockCallTimes()).toEqual({
						toGsapSpy: 0,
						setGsapSpy: 0,
						fromGsapSpy: 0,
						fromToSpy: 0,
						toSpy: 12,
						setSpy: 0,
						addLabelSpy: 2,
						addSpy: 4,
						timeScaleSpy: 0,
						consoleDebugSpy: 0,
					});
				});

				// REVIEW (techdebt) do we really need this?
				test.todo('peekOnly');
			});

			// REVIEW (animation) different animations for each MoveDestinationType? empty?
			describe('MoveDestinationType', () => {
				describe('cell', () => {
					test('empty', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select 1 KC-QD-JC');
						const gameStateTwo = gameStateOne.setCursor({ fixture: 'cell', data: [2] }).touch();
						expect(gameStateTwo.previousAction.text).toBe('invalid move 1c KC-QD-JC→cell');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#cKC', '#cKC', '#cKC',
							'#cQD', '#cQD', '#cQD',
							'#cJC', '#cJC', '#cJC',
						]);
						expect(addLabelSpy.mock.calls).toEqual([['invalidMoveCards.fromShorthands']]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 9,
							setSpy: 0,
							addLabelSpy: 1,
							addSpy: 3,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});

					test('single', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select 1 KC-QD-JC');
						const gameStateTwo = gameStateOne
							.setCursor({ fixture: 'cell', data: [1] })
							.touch({ stopWithInvalid: true });
						expect(gameStateTwo.previousAction.text).toBe('invalid move 1b KC-QD-JC→4C');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#cKC', '#cKC', '#cKC',
							'#cQD', '#cQD', '#cQD',
							'#cJC', '#cJC', '#cJC',
							'#c4C', '#c4C', '#c4C',
						]);
						expect(addLabelSpy.mock.calls).toEqual([
							['invalidMoveCards.fromShorthands'],
							['invalidMoveCards.toShorthands'],
						]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 12,
							setSpy: 0,
							addLabelSpy: 2,
							addSpy: 4,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});
				});

				describe('foundation', () => {
					test('empty', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cell', data: [0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select a 3C');
						const gameStateTwo = gameStateOne
							.setCursor({ fixture: 'foundation', data: [2] })
							.touch();
						expect(gameStateTwo.previousAction.text).toBe('invalid move ah 3C→foundation');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#c3C', '#c3C', '#c3C',
						]);
						expect(addLabelSpy.mock.calls).toEqual([['invalidMoveCards.fromShorthands']]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 3,
							setSpy: 0,
							addLabelSpy: 1,
							addSpy: 1,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});

					test('single', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cell', data: [0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select a 3C');
						const gameStateTwo = gameStateOne
							.setCursor({ fixture: 'foundation', data: [1] })
							.touch();
						expect(gameStateTwo.previousAction.text).toBe('invalid move ah 3C→2D');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#c3C', '#c3C', '#c3C',
							'#c2D', '#c2D', '#c2D',
						]);
						expect(addLabelSpy.mock.calls).toEqual([
							['invalidMoveCards.fromShorthands'],
							['invalidMoveCards.toShorthands'],
						]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 6,
							setSpy: 0,
							addLabelSpy: 2,
							addSpy: 2,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});
				});

				describe('cascade', () => {
					test('empty', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select 1 KC-QD-JC');
						const gameStateTwo = gameStateOne
							.setCursor({ fixture: 'cascade', data: [2, 0] })
							.touch({ stopWithInvalid: true });
						expect(gameStateTwo.previousAction.text).toBe('invalid move 13 KC-QD-JC→cascade');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#cKC', '#cKC', '#cKC',
							'#cQD', '#cQD', '#cQD',
							'#cJC', '#cJC', '#cJC',
						]);
						expect(addLabelSpy.mock.calls).toEqual([['invalidMoveCards.fromShorthands']]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 9,
							setSpy: 0,
							addLabelSpy: 1,
							addSpy: 3,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});

					test('single', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select 1 KC-QD-JC');
						const gameStateTwo = gameStateOne
							.setCursor({ fixture: 'cascade', data: [1, 0] })
							.touch({ stopWithInvalid: true });
						expect(gameStateTwo.previousAction.text).toBe('invalid move 12 KC-QD-JC→TH');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#cKC', '#cKC', '#cKC',
							'#cQD', '#cQD', '#cQD',
							'#cJC', '#cJC', '#cJC',
							'#cTH', '#cTH', '#cTH',
						]);
						expect(addLabelSpy.mock.calls).toEqual([
							['invalidMoveCards.fromShorthands'],
							['invalidMoveCards.toShorthands'],
						]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 12,
							setSpy: 0,
							addLabelSpy: 2,
							addSpy: 4,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});

					// REVIEW (animation) shake the whole sequence, not just the final card?
					test('sequence', () => {
						gameStateOne = gameStateOne.setCursor({ fixture: 'cascade', data: [0, 0] }).touch();
						expect(gameStateOne.previousAction.text).toBe('select 1 KC-QD-JC');
						const gameStateTwo = gameStateOne
							.setCursor({ fixture: 'cascade', data: [3, 0] })
							.touch({ stopWithInvalid: true });
						expect(gameStateTwo.previousAction.text).toBe('invalid move 14 KC-QD-JC→QC');

						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						// prettier-ignore
						expect(getCardIdsFromSpy(toSpy)).toEqual([
							'#cKC', '#cKC', '#cKC',
							'#cQD', '#cQD', '#cQD',
							'#cJC', '#cJC', '#cJC',
							'#cQC', '#cQC', '#cQC',
						]);
						expect(addLabelSpy.mock.calls).toEqual([
							['invalidMoveCards.fromShorthands'],
							['invalidMoveCards.toShorthands'],
						]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: 0,
							toSpy: 12,
							setSpy: 0,
							addLabelSpy: 2,
							addSpy: 4,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});
				});
			});
		});
	});

	describe('actionText examples', () => {
		const skipThrow = true; // TODO (techdebt) remove after we finish all tests
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES);
		afterAll(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			expect(actionTextExamples).toEqual([]);
		});
		beforeEach(() => {
			// eslint-disable-next-line jest/no-standalone-expect
			const actionText = (/·(.*)$/.exec(expect.getState().currentTestName ?? '')?.[1] ?? '').trim();
			if (actionText) {
				pullActionTextExamples(actionTextExamples, actionText);
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'init');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'init with invalid history');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'init partial');
		describe('animate init', () => {
			test.todo('· init');

			test.todo('· init with invalid history');

			test.todo('· init partial');
		});

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'deal all cards');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'deal most cards');
		describe('game setup', () => {
			test('· shuffle deck (1)', () => {
				const actionText = 'shuffle deck (1)';
				const gameStateOne = FreeCell.parse(ACTION_TEXT_EXAMPLES[actionText]);
				const gameStateTwo = gameStateOne.shuffle32(1);
				const gameStateThree = gameStateTwo.undo();

				// spot check
				expect(gameStateOne.print({ includeHistory: true })).toBe(
					new FreeCell().print({ includeHistory: true })
				);
				expect(gameStateOne.print({ includeHistory: true })).toBe(ACTION_TEXT_EXAMPLES[actionText]);
				expect(gameStateTwo.previousAction.text).toBe(actionText);
				expect(gameStateThree.print({ includeHistory: true })).toBe(
					gameStateOne.print({ includeHistory: true })
				);

				// both →←
				const { rerender } = render(
					<MockGamePage games={[gameStateOne, gameStateTwo, gameStateThree]} />
				);
				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo, gameStateThree]} />);

				// shuffle animation
				expect(getCardIdsFromSpy(toSpy)).toEqual(['#cAD', '#cAD', '#cAH', '#cAH']);
				expect(getCardIdsFromSpy(setSpy)).toEqual(['#cAD', '#cAH']);
				expect(addLabelSpy.mock.calls).toEqual([['shuffle']]);
				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 0,
					toSpy: 4,
					setSpy: 2,
					addLabelSpy: 1,
					addSpy: 2,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});

				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo, gameStateThree]} />);

				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 0,
					toSpy: 0,
					setSpy: 0,
					addLabelSpy: 0,
					addSpy: 0,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
			});

			test.todo('· deal all cards');

			test.todo('· deal most cards');
		});

		// prettier-ignore
		const ftcf_toSpyIDs = [
			'#c8S',
			'#cAC', // top left
			'#cAC', // zIndex
			'#cAD', // top left
			'#cAD', // zIndex
			'#cAH', // …
			'#cAH', // …
			'#cAS',
			'#cAS',
			'#c2C', '#c2C', '#c2D', '#c2D', '#c2H', '#c2H', '#c2S', '#c2S',
			'#c3C', '#c3C', '#c3D', '#c3D', '#c3H', '#c3H', '#c3S', '#c3S',
			'#c4C', '#c4C', '#c4D', '#c4D', '#c4H', '#c4H', '#c4S', '#c4S',
			'#c5C', '#c5C', '#c5D', '#c5D', '#c5H', '#c5H', '#c5S', '#c5S',
			'#c6C', '#c6C', '#c6D', '#c6D', '#c6H', '#c6H', '#c6S', '#c6S',
			'#c7C', '#c7C', '#c7D', '#c7D', '#c7H', '#c7H', '#c7S', '#c7S',
			'#c8C', '#c8C', '#c8D', '#c8D', '#c8H', '#c8H', '#c8S', '#c8S',
			'#c9C', '#c9C', '#c9D', '#c9D', '#c9H', '#c9H', '#c9S', '#c9S',
			'#cTC', '#cTC', '#cTD', '#cTD', '#cTH', '#cTH', '#cTS', '#cTS',
			'#cJC', '#cJC', '#cJD', '#cJD', '#cJH', '#cJH', '#cJS', '#cJS',
			'#cQC', '#cQC', '#cQD', '#cQD', '#cQH', '#cQH', '#cQS', '#cQS',
			'#cKC', '#cKC', '#cKD', '#cKD', '#cKH', '#cKH', '#cKS', '#cKS',
		];
		// prettier-ignore
		const ftcf_toSpyUndoIDs = [
			'#c2C', '#c7H', // home row
			'#cAC', '#c5H', '#c6C', '#c6D', '#cKC', '#cKD', '#cKH', '#cKS', // 0
			'#cAD', '#cAH', '#c4S', '#c5S', '#cQC', '#cQD', '#cQH', '#cQS', // 1
			'#cAS', '#c3D', '#c4H', '#cJC', '#cJD', '#cJH', '#cJS',         // 2
			'#c3C', '#c8S', '#cTC', '#cTD', '#cTH', '#cTS',                 // 3
			'#c2H', '#c9C', '#c9D', '#c9H', '#c9S',                         // 4
			'#c8C', '#c8D', '#c8H', // 5
			'#c7C', '#c7D', '#c7S', // 6
			'#c6H', '#c6S',         // 7
			'#c5C', '#c5D',         // 8
			'#c4C', '#c4D',         // 9
			'#c3H', '#c3S',         // 10
			'#c2D', '#c2S',         // 11
		];
		describe('move and undo', () => {
			describe('add to the each', () => {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (skipThrow) pullActionTextExamples(actionTextExamples, 'move 8h AD→foundation');
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (skipThrow) pullActionTextExamples(actionTextExamples, 'move 57 KS→cascade');
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (skipThrow) pullActionTextExamples(actionTextExamples, 'move 78 JH-TC-9H-8S-7H→QS');
				test.todo('· move 8h AD→foundation');
				test.todo('· move 57 KS→cascade');
				test.todo('· move 78 JH-TC-9H-8S-7H→QS');
			});

			describe.each`
				actionText                                    | shorthandMove | toSpyIDs                                    | fromToSpyIDs                | setSpyLength | toSpyUndoIDs         | fromToSpyUndoIDs     | labels
				${'move 3a KC→cell'}                          | ${'3a'}       | ${['#cKC']}                                 | ${['#cKC']}                 | ${51}        | ${undefined}         | ${undefined}         | ${undefined}
				${'move 15 TD→JS'}                            | ${'15'}       | ${['#cTD']}                                 | ${['#cTD']}                 | ${51}        | ${undefined}         | ${undefined}         | ${undefined}
				${'move 23 KC-QD-JS→cascade'}                 | ${'23'}       | ${['#cKC', '#cQD', '#cJS']}                 | ${['#cKC', '#cQD', '#cJS']} | ${49}        | ${undefined}         | ${undefined}         | ${undefined}
				${'move 53 6H→7C (auto-foundation 2 AD)'}     | ${'53'}       | ${['#c6H', '#cAD']}                         | ${['#c6H', '#cAD']}         | ${50}        | ${undefined}         | ${undefined}         | ${[['updateCardPositionsPrev'], ['updateCardPositions']]}
				${'move 14 2S→3D (auto-foundation 14 AS,2S)'} | ${'14'}       | ${['#c2S', '#cAS', '#cAS', '#c2S', '#c2S']} | ${['#c2S']}                 | ${50}        | ${['#cAS', '#c2S']}  | ${['#cAS', '#c2S']}  | ${[['updateCardPositionsPrev'], ['updateCardPositions']]}
				${'move 21 8H-7C→cascade'}                    | ${'21'}       | ${['#c8H', '#c7C']}                         | ${['#c8H', '#c7C']}         | ${50}        | ${undefined}         | ${undefined}         | ${undefined}
				${FIFTY_TWO_CARD_FLOURISH}                    | ${'3b'}       | ${ftcf_toSpyIDs}                            | ${['#c8S']}                 | ${0}         | ${ftcf_toSpyUndoIDs} | ${ftcf_toSpyUndoIDs} | ${[['updateCardPositionsPrev'], ['updateCardPositions']]}
			`(
				'$actionText',
				({
					actionText,
					shorthandMove,
					toSpyIDs,
					fromToSpyIDs,
					setSpyLength,
					toSpyUndoIDs = toSpyIDs,
					fromToSpyUndoIDs = fromToSpyIDs,
					labels = [['updateCardPositions']],
				}: {
					actionText: string;
					shorthandMove: string;
					toSpyIDs: string[];
					fromToSpyIDs: string[];
					setSpyLength: number;
					toSpyUndoIDs: string[] | undefined;
					fromToSpyUndoIDs: string[] | undefined;
					labels: string[][] | undefined;
				}) => {
					let gameStateOne: FreeCell;
					let gameStateTwo: FreeCell;
					let gameStateThree: FreeCell;
					beforeAll(() => {
						gameStateOne = FreeCell.parse(ACTION_TEXT_EXAMPLES[actionText]);
						gameStateTwo = gameStateOne.moveByShorthand(shorthandMove);
						gameStateThree = gameStateTwo.undo();
						pullActionTextExamples(actionTextExamples, actionText);
					});

					test('spot check', () => {
						expect(gameStateOne.print({ includeHistory: true })).toBe(
							ACTION_TEXT_EXAMPLES[actionText]
						);
						expect(gameStateTwo.previousAction.text).toBe(actionText);
						expect(gameStateThree.print({ includeHistory: true })).toBe(
							gameStateOne.print({ includeHistory: true })
						);
						// expect(gameStateThree.print()).toBe(gameStateOne.print()); // TODO (techdebt) move cursor during undo
					});

					test('move →', () => {
						const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

						expect(getCardIdsFromSpy(toSpy)).toEqual(toSpyIDs);
						expect(getCardIdsFromSpy(fromToSpy)).toEqual(fromToSpyIDs);
						expect(getCardIdsFromSpy(setSpy).length).toBe(setSpyLength);
						// TODO (techdebt) confirm which cards are not in setSpy
						expect(addLabelSpy.mock.calls).toEqual(labels);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: fromToSpyIDs.length,
							toSpy: toSpyIDs.length,
							setSpy: setSpyLength,
							addLabelSpy: labels.length,
							addSpy: 0,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});

					test('undo ←', () => {
						const { rerender } = render(<MockGamePage games={[gameStateTwo, gameStateThree]} />);
						mockReset();
						rerender(<MockGamePage games={[gameStateTwo, gameStateThree]} />);

						expect(getCardIdsFromSpy(toSpy)).toEqual(toSpyUndoIDs);
						expect(getCardIdsFromSpy(fromToSpy)).toEqual(fromToSpyUndoIDs);
						expect(getCardIdsFromSpy(setSpy).length).toBe(setSpyLength);
						expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: fromToSpyUndoIDs.length,
							toSpy: toSpyUndoIDs.length,
							setSpy: setSpyLength,
							addLabelSpy: 1,
							addSpy: 0,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});

					test('both →←', () => {
						const { rerender } = render(
							<MockGamePage games={[gameStateOne, gameStateTwo, gameStateThree]} />
						);
						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo, gameStateThree]} />);

						expect(getCardIdsFromSpy(toSpy)).toEqual(toSpyIDs);
						expect(getCardIdsFromSpy(fromToSpy)).toEqual(fromToSpyIDs);
						expect(getCardIdsFromSpy(setSpy).length).toBe(setSpyLength);
						expect(addLabelSpy.mock.calls).toEqual(labels);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: fromToSpyIDs.length,
							toSpy: toSpyIDs.length,
							setSpy: setSpyLength,
							addLabelSpy: labels.length,
							addSpy: 0,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});

						mockReset();
						rerender(<MockGamePage games={[gameStateOne, gameStateTwo, gameStateThree]} />);

						expect(getCardIdsFromSpy(toSpy)).toEqual(toSpyUndoIDs);
						expect(getCardIdsFromSpy(fromToSpy)).toEqual(fromToSpyUndoIDs);
						expect(getCardIdsFromSpy(setSpy).length).toBe(setSpyLength);
						expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
						expect(mockCallTimes()).toEqual({
							toGsapSpy: 0,
							setGsapSpy: 0,
							fromGsapSpy: 0,
							fromToSpy: fromToSpyUndoIDs.length,
							toSpy: toSpyUndoIDs.length,
							setSpy: setSpyLength,
							addLabelSpy: 1,
							addSpy: 0,
							timeScaleSpy: 0,
							consoleDebugSpy: 0,
						});
					});
				}
			);
		});

		/**
			just autoFoundation when we've previously skipped it
			we can't get here through normal gameplay
		*/
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'auto-foundation 56 KD,KS');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'flourish 56 KD,KS');
		describe('autoFoundationAll', () => {
			test.todo('· auto-foundation 56 KD,KS');

			test.todo('· flourish 56 KD,KS');
		});

		/** singular animation */
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'select QS');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'select 4D-3S-2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'select 8 7C');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'select 8 4D-3S-2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'deselect AS');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'deselect 4D-3S-2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'deselect 6 2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'deselect 6 4D-3S-2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'invalid move 86 7D→9C');
		describe('animate', () => {
			// peekOnly
			test.todo('· select QS');

			// peekOnly
			test.todo('· select 4D-3S-2D');

			// (canMove), !peekOnly
			test.todo('· select 8 7C');

			// (canMove), !peekOnly
			test.todo('· select 8 4D-3S-2D');

			// peekOnly
			test.todo('· deselect AS');

			// peekOnly
			test.todo('· deselect 4D-3S-2D');

			// (canMove), !peekOnly
			test.todo('· deselect 6 2D');

			// (canMove), !peekOnly
			test.todo('· deselect 6 4D-3S-2D');

			test.todo('· invalid move 86 7D→9C');

			test('· invalid move 75 6D-5S-4D-3C→7C', () => {
				const gameStateOne = FreeCell.parse(ACTION_TEXT_EXAMPLES['invalid move 75 6D-5S-4D-3C→7C']);
				const gameStateTwo = gameStateOne.$touchAndMove(
					{ fixture: 'cascade', data: [4, 3] },
					{ stopWithInvalid: true }
				);
				expect(gameStateTwo.previousAction.text).toBe('invalid move 75 6D-5S-4D-3C→7C');

				const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
				mockReset();
				rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

				// prettier-ignore
				expect(getCardIdsFromSpy(toSpy)).toEqual([
					'#c6D', '#c6D', '#c6D',
					'#c5S', '#c5S', '#c5S',
					'#c4D', '#c4D', '#c4D',
					'#c3C', '#c3C', '#c3C',
					'#c7C', '#c7C', '#c7C',
				]);
				expect(addLabelSpy.mock.calls).toEqual([
					['invalidMoveCards.fromShorthands'],
					['invalidMoveCards.toShorthands'],
				]);
				expect(mockCallTimes()).toEqual({
					toGsapSpy: 0,
					setGsapSpy: 0,
					fromGsapSpy: 0,
					fromToSpy: 0,
					toSpy: 15,
					setSpy: 0,
					addLabelSpy: 2,
					addSpy: 5,
					timeScaleSpy: 0,
					consoleDebugSpy: 0,
				});
			});
		});

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set KH');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set b');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set h⡂');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set h AD');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set 6 2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor set 3');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor up');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor left');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor down');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor right');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor up w');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor left w');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor down w');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor right w');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop KH');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop b');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop h⡂');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop h AD');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop 6 2D');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'cursor stop 3');
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (skipThrow) pullActionTextExamples(actionTextExamples, 'touch stop');
		describe('do not animate', () => {
			test.todo('· cursor set');
			test.todo('· cursor set KH');
			test.todo('· cursor set b');
			test.todo('· cursor set h⡂');
			test.todo('· cursor set h AD');
			test.todo('· cursor set 6 2D');
			test.todo('· cursor set 3');

			test.todo('· cursor up');

			test.todo('· cursor left');

			test.todo('· cursor down');

			test.todo('· cursor right');

			test.todo('· cursor up w');

			test.todo('· cursor left w');

			test.todo('· cursor down w');

			test.todo('· cursor right w');

			test.todo('· cursor stop');
			test.todo('· cursor stop KH');
			test.todo('· cursor stop b');
			test.todo('· cursor stop h⡂');
			test.todo('· cursor stop h AD');
			test.todo('· cursor stop 6 2D');
			test.todo('· cursor stop 3');

			test.todo('· touch stop');
		});
	});

	// manual testing scenarios are for visual fine-tuning
	// these may be [basically] duplicates of other unit tests
	describe('manual testing scenarios', () => {
		test.todo('52CardFlourish');

		test.todo('readyToAutoFoundation');

		test.todo('win foundation -> deck');

		test.todo('animations 0');

		test.todo('animations 1');

		test.todo('animations 2');
	});

	describe('bugfix', () => {
		test('broken Undo 2S (animation)', () => {
			const gamePrint =
				'    3H 8D 4D AC 2D AH 2S \n' +
				'    JC 9D 9C KD KC KS 5C \n' +
				'    JD 8S 4C QS    QH 2H \n' +
				'    6D 7D 3C       JS TD \n' +
				'    6H 6C 7S       TH 9S \n' +
				'    QC 5H QD          2C \n' +
				'    KH    TS          5S \n' +
				'    8H    JH          4H \n' +
				'    7C    TC          3S \n' +
				'          9H             \n' +
				'          8C             \n' +
				'          7H             \n' +
				'          6S             \n' +
				'          5D             \n' +
				'          4S             \n' +
				'          3D             \n' +
				' move 14 2S→3D (auto-foundation 14 AS,2S)\n' +
				':h shuffle32 2107\n' +
				' 64 62 6a 6b 3c 34 14 74 \n' +
				' 34 38 3d 34 18 15 73 71 \n' +
				' 73 57 53 57 54 13 a5 16 \n' +
				' 14 ';
			expect(gamePrint).toEqual(ACTION_TEXT_EXAMPLES['move 21 8H-7C→cascade']);
			const gameStateOne = FreeCell.parse(gamePrint).moveByShorthand('21');
			expect(gameStateOne.previousAction).toEqual({
				text: 'move 21 8H-7C→cascade',
				type: 'move',
			});
			expect(gameStateOne.print({ includeHistory: true })).toBe(
				'' + //
					'    3H 8D 4D AC 2D AH 2S \n' +
					' 8H JC 9D 9C KD KC KS 5C \n' +
					' 7C JD 8S 4C QS    QH 2H \n' +
					'    6D 7D 3C       JS TD \n' +
					'    6H 6C 7S       TH 9S \n' +
					'    QC 5H QD          2C \n' +
					'    KH    TS          5S \n' +
					'          JH          4H \n' +
					'          TC          3S \n' +
					'          9H             \n' +
					'          8C             \n' +
					'          7H             \n' +
					'          6S             \n' +
					'          5D             \n' +
					'          4S             \n' +
					'          3D             \n' +
					' move 21 8H-7C→cascade\n' +
					':h shuffle32 2107\n' +
					' 64 62 6a 6b 3c 34 14 74 \n' +
					' 34 38 3d 34 18 15 73 71 \n' +
					' 73 57 53 57 54 13 a5 16 \n' +
					' 14 21 '
			);
			const gameStateTwo = gameStateOne.undo();
			expect(gameStateTwo.previousAction).toEqual({
				text: 'move 14 2S→3D (auto-foundation 14 AS,2S)',
				type: 'move-foundation',
				tweenCards: [
					{ rank: '2', suit: 'spades', location: { fixture: 'cascade', data: [3, 15] } },
				],
				gameFunction: 'undo',
			});
			expect(gameStateTwo.print({ includeHistory: true })).toBe(gamePrint);

			// "2 of spades" does not move between states
			const gameStateOne_2S = gameStateOne.cards.find(
				({ rank, suit }) => rank === '2' && suit === 'spades'
			);
			const gameStateTwo_2S = gameStateTwo.cards.find(
				({ rank, suit }) => rank === '2' && suit === 'spades'
			);
			expect(gameStateOne_2S?.location).toEqual({ fixture: 'foundation', data: [3] });
			expect(gameStateTwo_2S?.location).toEqual({ fixture: 'foundation', data: [3] });
			expect(gameStateOne_2S?.location).toBe(gameStateOne_2S?.location);

			const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);
			mockReset();
			rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

			expect(getCardIdsFromSpy(toSpy)).toEqual([
				// '#c2S',
				'#c8H',
				'#c7C',
			]);
			expect(getCardIdsFromSpy(fromToSpy)).toEqual([
				// '#c2S',
				'#c8H',
				'#c7C',
			]);
			const setCardIds = getCardIdsFromSpy(setSpy);
			expect(setCardIds).toContain('#c2S');
			expect(setCardIds.length).toBe(50);
			expect(setCardIds).not.toContain('#c7C'); // 51
			expect(setCardIds).not.toContain('#c8H'); // 52
			expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
			expect(mockCallTimes()).toEqual({
				toGsapSpy: 0,
				setGsapSpy: 0,
				fromGsapSpy: 0,
				fromToSpy: 2,
				toSpy: 2,
				setSpy: 50,
				addLabelSpy: 1,
				addSpy: 0,
				timeScaleSpy: 0,
				consoleDebugSpy: 0,
			});
		});

		/**
			all cards resetting to 0,0
			Solution: initial positions were being set in useEffect instead of useGSAP
			          this isn't something a unit test can detect or fix
						 it _probably_ works with `npm start` because react runs effects twice in development mode (once in prod)

			This does NOT happen on the dev server (npm start), neither mobile nor desktop.
			This DOES happen in the final build, both mobile and desktop, both spinnytea.bitbucket.io/freecell and `npm run build && npm run serve`.

			This only happens on the first action if the cards don't move.
			_Any_ action that doesn't move the cards (e.g. cursor right, touch stop).
			It fixes itself if you resize the window (before or after), since everything moves.

			This does not happen when the cards are in the deck (i.e. cursor right); there's a global click to deal the cards.
			It only happens when there are cards on the board.

			We can't reproduce this here yet, so the only way to check it is:
			- make a change
			- `npm run build && npm run serve`

			Second paint:
			- `updateCardPositions` sets everything (as expected)
			- `previousTLZ` is empty (as expected)
			Initial paint:
			- `updateCardPositions` is empty (as expected)
			- `previousTLZ` has all the correct values (as it should be)
		*/
		test('Setting all cards after refresh then touch stop', () => {
			const gameStateOne = new FreeCell().shuffle32(24827).dealAll().moveByShorthand('7a');
			expect(gameStateOne.print({ includeHistory: true })).toBe(
				'' + //
					' 8H          AS AD       \n' +
					' 8D 6C JS 3D 3H 9D 8C 6S \n' +
					' 2H 9S QC 9C 7D 2S 9H JD \n' +
					' 2C AC 5D 5C TS AH QH KH \n' +
					' TH 6D 5H 3S TD 4H    6H \n' +
					' 7H 8S KS TC KC QS    3C \n' +
					' QD 2D KD 7S JH 4S    4C \n' +
					' JC 5S 4D 7C             \n' +
					' move 7a 8H→cell (auto-foundation 77 AS,AD)\n' +
					':h shuffle32 24827\n' +
					' 7a '
			);
			const gameStateTwo = gameStateOne.setCursor({ fixture: 'foundation', data: [0] }).touch();
			expect(gameStateTwo.print()).toBe(
				'' + //
					' 8H         >AS AD       \n' +
					' 8D 6C JS 3D 3H 9D 8C 6S \n' +
					' 2H 9S QC 9C 7D 2S 9H JD \n' +
					' 2C AC 5D 5C TS AH QH KH \n' +
					' TH 6D 5H 3S TD 4H    6H \n' +
					' 7H 8S KS TC KC QS    3C \n' +
					' QD 2D KD 7S JH 4S    4C \n' +
					' JC 5S 4D 7C             \n' +
					' touch stop'
			);

			const { rerender } = render(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

			expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
			expect(mockCallTimes()).toEqual({
				toGsapSpy: 0,
				setGsapSpy: 0,
				fromGsapSpy: 0,
				fromToSpy: 0,
				toSpy: 0,
				setSpy: 52,
				addLabelSpy: 1,
				addSpy: 0,
				timeScaleSpy: 0,
				consoleDebugSpy: 0,
			});

			mockReset();
			rerender(<MockGamePage games={[gameStateOne, gameStateTwo]} />);

			expect(mockCallTimes()).toEqual({
				toGsapSpy: 0,
				setGsapSpy: 0,
				fromGsapSpy: 0,
				fromToSpy: 0,
				toSpy: 0,
				setSpy: 0,
				addLabelSpy: 0,
				addSpy: 0,
				timeScaleSpy: 0,
				consoleDebugSpy: 0,
			});
		});
	});
});
