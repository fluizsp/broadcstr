import React from 'react';
import { Provider } from 'react-redux';
import { createSlice, configureStore } from '@reduxjs/toolkit'
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { Logo } from './Logo';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import HomeContainer from './containers/HomeContainer';
import rootReducer from './reducer';

import { extendTheme } from "@chakra-ui/react"
import { loadRelay } from './actions/relay';

const store = configureStore({
  reducer: rootReducer
})

store.dispatch(loadRelay());

// 2. Call `extendTheme` and pass your custom values
const customTheme = extendTheme({
  global: {
  },
  colors: {
    brand: {
      purple: "#874DF8",
      green: "#1EF0B2",
      kindsteel1: "#E9DEFA",
      kindsteel2: "#FBFCDB"
    },
  },
})

const splash2 = <h2>aaa</h2>;

const splash = <Box textAlign="center" fontSize="xl">
  <Grid minH="100vh" p={200} bgGradient='linear(to-br, brand.purple, brand.green)'>
    <VStack spacing={10}>
      <Logo h="40vmin" pointerEvents="none" />
      <Text color="gray.50">
        Welcome!
      </Text>
      <Link
        color="gra  y.50"
        href="/app"
        fontSize="2xl"
        rel="noopener noreferrer"
      >
        Launch App!
      </Link>
    </VStack>
  </Grid>
</Box>

function App() {
  
  return (
    <Provider store={store}>
      <ChakraProvider theme={customTheme}>
        <Router>
          <Routes>
            <Route path="/" element={splash} />
            <Route path="/app" element={<HomeContainer />} />
          </Routes>
        </Router>
      </ChakraProvider >
    </Provider>
  );
}

export default App;
