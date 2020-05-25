## Conveniently persist redux store for easy retrieval.

We will be exploring easy ways of persisting redux store. If you have built a react application before using redux, you must have, at some point, looked for a way to persist some data in the store, to prevent making multiple requests to get those same data.

For some context, let use a simple authentication example. Say we have an application that uses jwt token authentication. When the user logs in, we get a response that contains the token that is required for every subsequent request. When we get this token, we need to add it to the redux store, but we do not want to make a request every time the user reopens our app, to retrieve the token again, right? so, we need to persist the store containing the token and retrieve it, so we can make use of it in making our requests.

For anyone that does not have a proper understanding of how to setup redux in an application, [here is a great example](https://medium.com/backticks-tildes/setting-up-a-redux-project-with-create-react-app-e363ab2329b8) to get you up and running so you can follow properly. The example used in this project follows the same article. You can find a link to the repository [here](https://github.com/spankie/redux-cra)

Now, we have our react app set up with redux, let persist some data. We will be using a cool package named [redux easy persist](https://github.com/peter-olom/redux-easy-persist). This package helps us with persisting the store, based on any storage we specify (we will talk about how soon). 

First of all, lets install it. To install this package run the following command:

```$ npm install redux-easy-persist ```

or 

```$ yarn add redux-easy-persist```

After installing this package, we would configure it by adding a middleware to our redux store. This middleware would persist the data when ever there is a new item being saved. To do this, your `store.js` would look like this:

```javascsript
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/rootReducer';
import createPersistor from "redux-easy-persist";

const AsyncStorage = {
  getItem: (key) => {
    return new Promise((resolve, reject) => {
      const item = localStorage.getItem(key);
      if (!item) {
        return reject("no value");
      }
      return resolve(item);
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value);
        resolve(key + " set successfully");
      }catch(error) {
        reject("something went wrong");
      }
    })
  }
}

// create a persistor and pass in storeEngine and persistKey
const persistor = createPersistor({
  storeEngine: AsyncStorage,
  persistKey: 'rootState',
});

export default function configureStore(initialState={}) {
 return createStore(rootReducer, initialState, applyMiddleware(thunk, persistor));
}
```

What we are doing here is specifying a storage engine for the persistor to use in storing and retrieving our data. This is really helpful since we can configure whatever way we want the data to be stored. In this case we are using `localStorage`. The storage engine requires an object with two methods; `getItem(key)` and `setItem(key, value)`, both of these methods are expected to return a promise, hence the wrapping of the `localStorage` methods in a promise.


Next we are going to configure the hydration of the store when the app loaded. By hydration I mean populating the store with the values that was saved. And the best place to do this is in `index.js` since that is where our app is bootstrapped. Here is a snippet of how our `index.js` should look like;

```
...

import { hydrate } from "redux-easy-persist";
import { Provider } from 'react-redux';
import configureStore from './store';

// get the store
let store = configureStore();

// this would retrieve the store from persistent storage
hydrate(store);

ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>,
  document.getElementById('root')
);
...
```

In the above snippet, we are using the hydrate method from the `redux-easy-persist` package to populate the store with existing values. Every time the app is reloaded, whatever value we have saved will be "hydrated" into the store for use later.

Now, in for the authentication example we have, I have modified the source code from the redux article mentioned above to add a jwt token to the store whenever the button on the page is clicked. Source code for this example can be found [here](https://github.com/spankie/redux-cra).

Here is the action for adding the token.

```
export const addToken = (payload) => dispatch => {
 dispatch({
  type: 'ADD_TOKEN',
  payload
 })
}
```

With the changes made to the example, here is a snippet of changes made to our `App.js`.

```
...

import { addToken } from './actions/addToken';

const mapStateToProps = state => ({
  ...state
})

const mapDispatchToProps = dispatch => ({
  addToken: (token) => dispatch(addToken(token))
})

function App(props) {
  let Login = (event) => {
    // DO login
    // after loggin in, set the token in store.
    props.addToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p style={{width: "100%", wordWrap: "break-word"}}>
          {
            JSON.stringify(props)
          }
        </p>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={Login}>Test redux action</button>
      </header>
    </div>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

Finally, when the app is run and the button is clicked, the jwt token we specified will be added to the redux store and the redux-easy-persist package would persist the data to the `localStorage` based on what we provided and storage engine, and when the app is reloaded we still see the value we added previously.
