import { Action } from 'redux';

// Attempting to copy the shape of any abitrary reducer
interface ReducerMapShape<S, A extends Action> {
	(state: S, action: A): S;
}
// Redux specifies a general State shape of any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ss = any;
// Redux Action has a type Action<T = any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Aa = any;

// This indexable type will allow us safely pass through our reducers and
// wrap them without changing their identity
interface ReducerMap {
	[index: string]: ReducerMapShape<Ss, Aa>;
}

export default function <T extends ReducerMap>(reducers: T): T {
	const returnMap: ReducerMap = {};
	for (const key in reducers) {
		// wrap reducers here
		if (reducers.hasOwnProperty(key)) {
			const reducer = reducers[key];
			const wrappedReducer = (state: unknown, action: Record<string, unknown>) => {
				if (action['type'] == 'HYDRATE') {
					// Every reducer must have a state.
					// This state often takes the shape of a keyvalue pair
					// As such assert the HYDRATE payload to have structure of key, value
					const p = action['payload'] as Record<string, unknown>;
					state = p[key];
				}
				if (action.type === 'CLEAR_STATE') {
					state = undefined;
				}
				return reducer(state, action);
			};
			returnMap[key] = wrappedReducer;
		}
	}
	// return ReducerMap which has been modified but still appears intact to TypeScript
	return returnMap as T;
}
