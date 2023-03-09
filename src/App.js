import React from 'react';
import { Provider } from 'react-redux';
import {
  ChakraProvider,
} from '@chakra-ui/react';
import store from './store';

import { extendTheme } from "@chakra-ui/react"
import { getUsersMetadata, initializeRelays, listNotesRelateds, loadRelays, selectMetadatas, SELECT_NOTES } from './actions/relay';
import AppContainer from './containers/AppContainer';
import { saveState } from './localStorage';
import { throttle } from 'lodash';
import { mode } from '@chakra-ui/theme-tools';
import { defineMessages, IntlProvider } from 'react-intl';
import Portuguese from './i18n/pt-BR.json';
import English from './i18n/en-US.json';
import Spanish from './i18n/es.json';
import French from './i18n/fr.json';
import German from './i18n/de.json';

store.subscribe(throttle(() => {
  console.log('save state to storage')
  try {
    saveState(store.getState().user.account, 'user.account');
    saveState(store.getState().user.accountInfo, 'user.accountInfo');
    saveState(store.getState().user.likes, 'user.likes');
    saveState(store.getState().user.relays, 'user.relays');
    saveState(store.getState().user.usersMetadata, 'user.usersMetadata');
    saveState(store.getState().content.allNotes, 'content.allNotes');
  } catch { }
}, 30000));

if (!window.metadataInterval)
  window.metadataInterval = setInterval(() => {
    store.dispatch(getUsersMetadata());
    store.dispatch(listNotesRelateds());
  }, 5000)

// 2. Call `extendTheme` and pass your custom values
const customTheme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  global: {
  },
  colors: {
    brand: {
      darkUi: 'rgba(28,29,43,0.9)',
      darkUiAlpha: 'rgba(28,29,43,0.0)',
      lightUi: 'rgba(255,255,255,0.8)',
      lightUiAlpha: 'rgba(255,255,255,0.0)',
      purple: "#874DF8",
      green: "#1EF0B2",
      kindsteel1: "#E9DEFA",
      kindsteel2: "#FBFCDB",
      eternalConstance1: "#09203f",
      eternalConstance2: "#537895",
      purpleDivision1: "#7028e4",
      purpleDivision2: "#e5b2ca",
      zeusMiracle1: "#cd9cf2",
      zeusMiracle2: "#f6f3ff",
      blessing1: "#fddb92",
      blessing2: "#d1fdff"
    },
  },
})

function App() {
  const language = store.getState().user.language ?? navigator.language
  let i18nMessages = {};
  if (language === 'pt-BR' || language === 'pt')
    i18nMessages = Portuguese;
  else if (language === 'es-ES' || language === 'es')
    i18nMessages = Spanish;
  else if (language === 'fr')
    i18nMessages = French;
  else if (language === 'de')
    i18nMessages = German;
  else
    i18nMessages = English;

  defineMessages(i18nMessages);

  return (
    <Provider store={store}>
      <ChakraProvider theme={customTheme}>
        <IntlProvider locale={language} messages={i18nMessages}>
          <AppContainer />
        </IntlProvider>
      </ChakraProvider >
    </Provider>
  );
}

export default App;
