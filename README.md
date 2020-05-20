
# redux-easy-persist

A simple implementation of persistence for redux with minimal configuration.

### Installation

```bash
npm install redux-easy-persist
```

### Usage

```typescript
import { applyMiddleware, createStore, combineReducers } from "redux";
import createPersistor, { persistWrapper, hydrate } from "redux-easy-persist";
import AsyncStorage from '@react-native-community/async-storage';

// create a persistor and pass in storeEngine and persistKey
const persistor = createPersistor({
  storeEngine: AsyncStorage,
  persistKey: 'rootState',
});

// wrap reducers in persistWrapper and pass it to combineReducers
const rootReducer = combineReducers(persistWrapper({ 
  //...YOUR REDUCERS
}));

// create the store and pass in persistor as middleware
const store = createStore(rootReducer, applyMiddleware(persistor));

// call hydrate and pass in store to HYDRATE STORE from Storage
hydrate(store);

// you're all done

export default store

```

Persistor Options

```typescript

Peristor {
  persistKey: string, // state key in storage
	storeEngine: StoreEngine, // StoreEngine; any type of storage that implements "getItem" and "setItem" eg AsyncStorage
	whiteList?: Array<string>, // key name of reducers whose states you want to persist (optional)
	blackList?: Array<string>, // key names of reducers whose states you want excluded (optional)
}

NB: storage getItem and setItem should be promises
```

Example using Expo SecureStore as Storage

```typescript

import * as SecureStore from 'expo-secure-store';

// expose SecureStore.getItemAsync and SecureStore.setItemAsync as getItem and setItem respectively
const SecureStoreWrapper = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
};

const persistor = createPersistor({
  storeEngine: SecureStoreWrapper,
  persistKey: 'rootState',
});

// continue with the rest of the setup as shown in usage above

```


### Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License
[MIT](https://choosealicense.com/licenses/mit/)