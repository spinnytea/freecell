'use client';

import GameBoard from '@/app/GameBoard';
import GameContextProvider from '@/app/hooks/Game/GameContextProvider';
import { SettingsContextProvider } from '@/app/hooks/Settings/SettingsContextProvider';

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
