'use client';

import { useGSAP } from '@gsap/react';
import { gsap, Draggable } from 'gsap/all';
import GameBoard from '@/app/GameBoard';
import GameContextProvider from '@/app/hooks/Game/GameContextProvider';
import { SettingsContextProvider } from '@/app/hooks/Settings/SettingsContextProvider';

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);

// TODO (techdebt) unit test that clicks all the way through winning
export default function Page() {
	return (
		<SettingsContextProvider>
			<GameContextProvider>
				<GameBoard />
			</GameContextProvider>
		</SettingsContextProvider>
	);
}
