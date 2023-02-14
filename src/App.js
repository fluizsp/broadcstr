import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit'
import {
  ChakraProvider,
} from '@chakra-ui/react';
import rootReducer from './reducer';

import { extendTheme } from "@chakra-ui/react"
import { loadRelays } from './actions/relay';
import AppContainer from './containers/AppContainer';
import { saveState } from './localStorage';
import { throttle } from 'lodash';
import { mode } from '@chakra-ui/theme-tools';

const store = configureStore({
  reducer: rootReducer
},)

store.subscribe(throttle(() => {
  console.log('save state to storage')
  saveState(store.getState().user, 'user');
}, 60000));

store.dispatch(loadRelays());

// 2. Call `extendTheme` and pass your custom values
const customTheme = extendTheme({
  global: {
  },
  colors: {
    brand: {
      darkUi: 'rgba(28,29,43,0.9)',
      lightUi: 'rgba(255,255,255,0.8)',
      purple: "#874DF8",
      green: "#1EF0B2",
      kindsteel1: "#E9DEFA",
      kindsteel2: "#FBFCDB",
      eternalConstance1:"#09203f",
      eternalConstance2:"#537895"
    },
  },
})

function App() {

  return (
    <Provider store={store}>
      <ChakraProvider theme={customTheme}>
        <AppContainer />
      </ChakraProvider >
    </Provider>
  );
}

export default App;
