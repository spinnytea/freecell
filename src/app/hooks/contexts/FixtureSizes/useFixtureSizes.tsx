import { useContext } from 'react';
import { FixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { FixtureSizesContext } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContext';

export function useFixtureSizes(): FixtureSizes {
	return useContext(FixtureSizesContext);
}
