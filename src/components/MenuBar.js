import { Flex, Center, Box, Image, VStack, Button, Avatar, Text, Link, Show, Hide, Tooltip, HStack } from '@chakra-ui/react'
import { FaHashtag } from 'react-icons/fa';
import { GoHome } from 'react-icons/go';
import { IoMdSearch, IoIosSettings } from 'react-icons/io';
import { AiFillRead } from 'react-icons/ai';
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../logo_h.svg';
import smallLogo from '../logo_small.svg';

const MenuBar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    function goSplash() {
        navigate('/welcome');
    }
    function goHome() {
        navigate('/');
    }
    if (location.pathname === "/welcome")
        return null;
    return (<Show above="md">
        <Box w={{ md: '100px', lg: '330px' }} h="100vh" p="40px" bg="whiteAlpha.700"
            backdropFilter="auto" backdropBlur="6px" top="0" left="0" pos="fixed" zIndex="1"
            borderRight="1px" borderRightColor="white">
            <Center>
                {/*Desktop Menu*/}
                <Show above="lg">
                    <VStack name="desktop1" spacing="20">
                        <Image src={logo} w="225px" />
                        <VStack spacing="1">
                            <Button leftIcon={<GoHome />} variant="ghost" color={location.path === "/" ? 'blue.300' : ''} size="lg" onClick={goHome} >Home</Button>
                            <Button leftIcon={<IoMdSearch />} variant="ghost" color="gray.300" size="lg">Search</Button>
                            <Button leftIcon={<FaHashtag />} variant="ghost" color="gray.300" size="lg">Discover</Button>
                            <Button leftIcon={<AiFillRead />} variant="ghost" color="gray.300" size="lg" onClick={goSplash}>Read</Button>
                        </VStack>
                    </VStack>
                </Show>
                {/*Tablet Menu*/}
                <Hide above="lg">
                    <VStack spacing="20">
                        <Image src={smallLogo} w="90px" />
                        <VStack spacing="8" >
                            <Tooltip label="Home" fontSize='md'>
                                <Link fontSize="2xl" color="blue.300"><GoHome /></Link>
                            </Tooltip>
                            <Tooltip label="Search" fontSize='md'>
                                <Link fontSize="2xl" color="gray.300"><IoMdSearch /></Link>
                            </Tooltip>
                            <Tooltip label="Discover" fontSize='md'>
                                <Link fontSize="2xl" color="gray.300"><FaHashtag /></Link>
                            </Tooltip>
                            <Tooltip label="Read" fontSize='md'>
                                <Link fontSize="2xl" color="gray.300"><AiFillRead /></Link>
                            </Tooltip>
                        </VStack>
                    </VStack>
                </Hide>
            </Center>
            {/* ACCOUNT */}
            <Box w={{ md: '100px', lg: '330px' }} h="75px" p="4" bottom="0" left="0" pos="fixed" bg="whiteAlpha.700" verticalAlign="middle">
                <Flex wrap="wrap">
                    <Avatar src={props.accountInfo.picture??''} name={props.accountInfo.name??'Visitor'} bg="blue.300" mb="5" ml={{ md: 2, lg: 0 }} />
                    <VStack spacing="0" align="left" pl="2">
                        <HStack><Text fontSize="md">{props.accountInfo.name??'Visitor'}</Text><Text as="b" fontSize="xs">{props.accountInfo.nip05??''}</Text></HStack>
                        <Text w="180px" noOfLines="1" fontSize="xs">{props.account?props.account.publicKey:'no pub key'}</Text>
                    </VStack>
                    <VStack align="right" w="60px">
                        <Button variant="ghost" color="gray.400"><IoIosSettings /></Button>
                    </VStack>
                </Flex>
            </Box>
        </Box>
    </Show>)
}

export default MenuBar;