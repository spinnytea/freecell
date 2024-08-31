import { useContext } from 'react';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/FixtureSizes/FixtureSizesContext';

export function useFixtureSizes(): FixtureSizes {
	return useContext(FixtureSizesContext);
}
