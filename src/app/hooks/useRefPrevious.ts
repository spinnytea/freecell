import { MutableRefObject, useEffect, useRef } from 'react';

export function useRefPrevious<T>(value: T): MutableRefObject<T> {
	const ref = useRef<T>(value);

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref;
}
