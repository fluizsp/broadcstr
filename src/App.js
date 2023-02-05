import React from 'react';
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

import { extendTheme } from "@chakra-ui/react"

// 2. Call `extendTheme` and pass your custom values
const customTheme = extendTheme({
  global: {
  },
  colors: {
    brand: {
      purple: "#874DF8",
      green: "#1EF0B2",
      // ...
      900: "#1a202c",
    },
    backgroundColor: '#f40'
  },
})

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={200} bgGradient='linear(to-b, brand.purple, brand.green)'>
          <VStack spacing={10}>
            <Logo h="40vmin" pointerEvents="none" />
            <Text>
              Welcome!
            </Text>
            <Link
              color="grey.500"
              href="https://chakra-ui.com"
              fontSize="2xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Launch App!
            </Link>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
