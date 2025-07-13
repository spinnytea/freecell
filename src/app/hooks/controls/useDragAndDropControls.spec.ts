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
		// FIXME unit test
		describe('overlappingAvailableMove', () => {
			// x/y distance (l/r and t/b) cutoffs
			test.todo('check dist threshold');

			// empty | not | av | av | not | empty
			//      ^^^   ^^^  ^^^  ^^^   ^^^
			test.todo('boost for availableMove');

			test.todo('skip if not dragged');
		});

		test.todo('checkIfValid');

		test.todo('pointerCoordsToFixtureSizes');
	});
});
