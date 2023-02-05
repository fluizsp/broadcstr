import { Flex, Center, Box, Image, HStack, VStack, Button, Avatar, Text, Container, Grid, GridItem, Link, Card, LinkBox, Show, Hide } from '@chakra-ui/react'
import { FaHashtag, FaPaperclip } from 'react-icons/fa';
import { SearchOutline } from 'react-ionicons'
import { GoHome, GoSettings } from 'react-icons/go';
import { IoMdSettings, IoMdSearch } from 'react-icons/io';
import { HiPlusCircle } from 'react-icons/hi';
import { FiMoreHorizontal } from 'react-icons/fi';

import logo from '../logo_h.svg';
import smallLogo from '../logo_small.svg';
import Note from '../components/Note';

function AppContainer() {
    return (
        <Box bgGradient='linear(to-br, brand.kindsteel1, brand.kindsteel2)' >
            <Show above="md">
                <Box w={{ md: '100px', lg: '330px' }} h="100vh" p="40px" bg="whiteAlpha.700" backdropFilter="auto" backdropBlur="6px" top="0" left="0" pos="fixed" zIndex="1">
                    <Center>
                        {/*Desktop Menu*/}
                        <Show above="lg">
                            <VStack name="desktop1" spacing="20">
                                <Image src={logo} w="225px" />
                                <VStack spacing="1">
                                    <Button leftIcon={<GoHome />} variant="ghost" color="blue.300" size="lg" >Home</Button>
                                    <Button leftIcon={<IoMdSearch />} variant="ghost" color="gray.300" size="lg">Search</Button>
                                    <Button leftIcon={<FaHashtag />} variant="ghost" color="gray.300" size="lg">Trending</Button>
                                    <Button leftIcon={<FaPaperclip />} variant="ghost" color="gray.300" size="lg">Read</Button>
                                </VStack>
                            </VStack>
                        </Show>
                        {/*Desktop Smaller Menu*/}
                        <Hide above="lg">
                            <VStack spacing="20">
                                <Image src={smallLogo} w="90px" />
                                <VStack spacing="8" >
                                    <Link fontSize="2xl" color="blue.300"><GoHome /></Link>
                                    <Link fontSize="2xl" color="gray.300"><IoMdSearch /></Link>
                                    <Link fontSize="2xl" color="gray.300"><FaHashtag /></Link>
                                    <Link fontSize="2xl" color="gray.300"><FaPaperclip /></Link>

                                </VStack>
                            </VStack>
                        </Hide>
                    </Center>
                    <Box w={{ md: '100px', lg: '330px' }} h="75px" p="4" bottom="0" left="0" pos="fixed" bg="whiteAlpha.700" verticalAlign="middle">
                        <Flex wrap="wrap">
                            <Avatar src="https://member.cash/img/profilepics/5579868970219573173.128x128.jpg" mb="5" ml={{ md: 2, lg: 0 }} />
                            <VStack spacing="0" align="left" pl="2">
                                <Text as="b" fontSize="md">fluizsp</Text>
                                <Text w="180px" noOfLines="1" fontSize="xs">npub1d5s32lzg6a0c49u42tvmz9s0v6ldv6mkm4r</Text>
                            </VStack>
                            <Button isAttached="true" variant="ghost" color="gray.400"><IoMdSettings /></Button>
                        </Flex>
                    </Box>
                </Box>
            </Show>
            <Box ml={{ md: '100px', lg: '330px' }}>
                <Container maxW='4xl' pt="20px">
                    <Grid templateColumns='repeat(6, 1fr)' gap="3" mb="5">
                        <GridItem colSpan={4}>
                            <Box bg="whiteAlpha.700" h="54px" p="1">
                                <Center>
                                    <Button leftIcon={<HiPlusCircle />} variant="ghost" size="lg" fontSize="md" color="gray.400">What's on your mind?</Button>
                                </Center>
                            </Box>
                        </GridItem>
                        <GridItem colSpan={2}>
                            <Box bg="whiteAlpha.700" h="54px" p="4">
                                <Center>
                                    <Link as="b" pl="2" fontSize="sm" color="blue.300">For you</Link>
                                    <Link pl="2" fontSize="sm">Global</Link>
                                </Center>
                            </Box>
                        </GridItem>
                    </Grid>
                    <Note />
                    <Note />
                </Container>
            </Box>
        </Box>
    )
}
export default AppContainer();