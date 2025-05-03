import { MutableRefObject, useRef } from 'react';

export function useRefCurrent<T>(initialValue: T): MutableRefObject<T> {
	const ref = useRef<T>(initialValue);
	ref.current = initialValue;
	return ref;
}
