import { MutableRefObject, useRef } from 'react';

/**
	Wrapper for `useRef` that always uses the current in the constructor.

	useRef cannot take a "function" as an argument,
	so this ensures we don't need to call that function twice just to have the current value.

	@example
	const settingsRef = useRef(useSettings());
	settingsRef.current = useSettings();

	@example
	const settingsRef = useRefCurrent(useSettings());
*/
export function useRefCurrent<T>(initialValue: T): MutableRefObject<T> {
	const ref = useRef<T>(initialValue);
	ref.current = initialValue;
	return ref;
}
