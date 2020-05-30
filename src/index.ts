/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Store } from 'redux';
import persistWrapper from './persistWrapper';

export interface getItem {
	(key: string): Promise<string | null>;
}
export interface setItem {
	(key: string, value: string): Promise<void>;
}

export interface StoreEngine {
	getItem: getItem;
	setItem: setItem;
}

export interface Persistor {
	persistKey: string;
	storeEngine: StoreEngine;
	whiteList?: Array<string>;
	blackList?: Array<string>;
}

export default function createPersistor(config: Persistor) {
	return function persistor({ getState }: any) {
		return (next: (arg0: any) => any) => async (action: any) => {
			if (action.type == 'HYDRATE') {
				try {
					const res = await config.storeEngine.getItem(config.persistKey);
					Object.assign(action.payload, JSON.parse(res || '{}'));
				} catch (error) {
					console.log('FAILED TO HYDRATE');
				}
			}

			// Call the next dispatch method in the middleware chain.
			next(action);

			//persist state after update has been made to the store
			try {
				const state = getState();
				const persistingState: any = {};
				if (config.whiteList) {
					const { whiteList } = config;
					whiteList.map((s) => {
						// assign only objects keys in the white list
						persistingState[s] = state[s];
					});
				}

				if (config.blackList && !config.whiteList) {
					const { blackList } = config;
					for (const key in state) {
						if (state.hasOwnProperty(key)) {
							const element = state[key];
							if (blackList.indexOf(key) < 0) {
								//assign only object keys not in the white list
								persistingState[key] = element;
							}
						}
					}
				}

				if (!config.whiteList && !config.blackList) {
					Object.assign(persistingState, state);
				}
				await config.storeEngine.setItem(config.persistKey, JSON.stringify(persistingState));
			} catch (error) {
				console.log('FAILED TO PERSIST STORE');
			}

			// return to allow next middleware execution
			return true;
		};
	};
}

const hydrate = (store: unknown): void => {
	const assertStore = store as Store;
	assertStore.dispatch({ type: 'HYDRATE', payload: {} });
};

const clearPersistedState = (store: unknown): void => {
	const assertStore = store as Store;
	assertStore.dispatch({ type: 'CLEAR_STATE', payload: {} });
};

export { persistWrapper, hydrate, clearPersistedState };
