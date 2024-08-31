import { createContext } from 'react';
import { FixtureSizes } from '@/app/hooks/FixtureSizes/FixtureSizes';

// initialize with dummy values
export const FixtureSizesContext = createContext<FixtureSizes>({} as FixtureSizes);
