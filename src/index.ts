import { Store } from "redux";

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
	persistKey: string,
	storeEngine: StoreEngine,
	whiteList?: Array<string>,
	blackList?: Array<string>,
}

export default function createPersistor(config:Persistor) {
	return function persistor({ getState }: any) {
		return (next: (arg0: any) => any) => async (action: any) => {
			if(action.type == 'HYDRATE') {
				try {
					const res = await config.storeEngine.getItem(config.persistKey);
					Object.assign(action.payload, JSON.parse(res || "{}"));
				} catch (error) {
					console.log('FAILED TO HYDRATE')
				}
	
			}
	
			// Call the next dispatch method in the middleware chain.
			next(action);
	
			//persist state after update has been made to the store
			try {
				const state = getState();
				const persistingState:any = {};
				if (config.whiteList) {
					const { whiteList } = config;
					whiteList.map(s => {
						// assign only objects keys in the white list
						persistingState[s] = state[s];
					});
				}

				if (config.blackList && !config.whiteList) {
					const { blackList } = config;
					for (const key in state) {
						if (state.hasOwnProperty(key)) {
							const element = state[key];
							if(blackList.indexOf(key) < 0) {
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
	}
}

export function hydrate(store: Store){ 
  store.dispatch({ type: 'HYDRATE', payload: {} });
}

export function clearPersistedState(store: Store){
  store.dispatch({ type: 'CLEAR_STATE', payload: {} });
}

export function persistWrapper(reducers: any) {
	const wrappedReducers = {};
	for (const key in reducers) {
		if (reducers.hasOwnProperty(key)) {
			const reducer = reducers[key];
			const wrappedFunction = (state: any, action: {type: string, payload: any}) => {
				if (action.type === 'HYDRATE') {
					// @ts-ignore
					state = action.payload[key];
				}

				if (action.type === 'CLEAR_STATE') {
					// @ts-ignore
					state = undefined;
				}

				return reducer(state, action);
			}
			//@ts-ignore
			wrappedReducers[key] = wrappedFunction;
		}
	}
	return wrappedReducers;
}
