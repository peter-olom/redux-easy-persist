import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';

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

export default (config: Persistor): Middleware => {
	const mWare: Middleware = (api: MiddlewareAPI) => (next: Dispatch<AnyAction>) => async (action) => {
		if (action.type == 'HYDRATE') {
			try {
				const res = await config.storeEngine.getItem(config.persistKey);
				if (res) {
					Object.assign(action.payload, JSON.parse(res));
				}
				// console.log('PERSIST MIDDLEWARE LOG', action.payload);
			} catch (error) {
				console.log('FAILED TO HYDRATE');
			}
		}
		// Call the next dispatch method in the middleware chain.
		const returnValue = next(action);

		//persist state after update has been made to the store
		try {
			const state = api.getState();
			const persistingState: Record<string, unknown> = {};
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
							//assign only object keys not in the black list
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
		return returnValue;
	};
	return mWare;
};
