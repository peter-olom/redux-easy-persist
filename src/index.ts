import { Store } from 'redux';
import persistWrapper from './persistWrapper';
import createPersistor from './createPersistor';

const hydrate = (store: unknown): void => {
	const assertStore = store as Store;
	assertStore.dispatch({ type: 'HYDRATE', payload: {} });
};

const clearPersistedState = (store: unknown): void => {
	const assertStore = store as Store;
	assertStore.dispatch({ type: 'CLEAR_STATE', payload: {} });
};

export default createPersistor;
export { persistWrapper, hydrate, clearPersistedState };
