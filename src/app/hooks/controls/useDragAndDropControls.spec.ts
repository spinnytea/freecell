// TODO (techdebt) (controls) (drag-and-drop) (2-priority) "integration" test
describe('useDragAndDropControls', () => {
	test.todo('general');

	describe('each drag event', () => {
		test.todo('onClick');

		test.todo('onPress');

		test.todo('onDrag');

		test.todo('onRelease');

		test.todo('onDragEnd');
	});

	describe('helpers', () => {
		describe('overlappingAvailableMove', () => {
			// x/y distance (l/r and t/b) cutoffs
			test.todo('check dist threshold');

			describe('boost for availableMove', () => {
				// empty | not | av | av | not | empty
				//      ^^^   ^^^  ^^^  ^^^   ^^^
				test.todo('naan');

				// empty | av | not | av | empty
				//           ^^^ ^ ^^^
				test.todo('ana');

				// empty | av | not | not | not | av | empty
				//           ^^^   ^^^ ^ ^^^   ^^^
				test.todo('annna');
			});

			test.todo('skip if not dragged');
		});

		test.todo('checkIfValid');

		test.todo('pointerCoordsToFixtureSizes');
	});
});
