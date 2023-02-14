import { Flex, Center, Box, Image, VStack, Button, Avatar, Text, Link, Show, Hide, Tooltip, HStack, Menu, MenuButton, MenuItem, MenuList, MenuDivider } from '@chakra-ui/react'
import { FaHashtag } from 'react-icons/fa';
import { GoHome } from 'react-icons/go';
import { IoMdSearch, IoIosSettings, IoMdArrowDropup, IoIosPerson } from 'react-icons/io';
import { AiFillRead } from 'react-icons/ai';
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../logo_h.svg';
import logoDark from '../logo_h_dark.svg';
import smallLogo from '../logo_small.svg';
import { useColorModeValue, useColorMode, } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { BiDoorOpen } from 'react-icons/bi';

const MenuBar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const colorMode = useColorMode();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const logoSelector = useColorModeValue(logo, logoDark);
    function goSplash() {
        navigate('/welcome');
    }
    function logout(){
        props.logout();
        navigate('/welcome');
    }

    function goHome() {
        navigate('/');
    }
    if (location.pathname === "/welcome")
        return null;
    return (<Show above="md">
        <Box w={{ md: '100px', lg: '330px' }} h="100vh" p="40px" bg={uiColor}
            backdropFilter="auto" backdropBlur="6px" top="0" left="0" pos="fixed" zIndex="1"
            borderRight="1px" borderRightColor={uiColor}>
            <Center>
                {/*Desktop Menu*/}
                <Show above="lg">
                    <VStack name="desktop1" spacing="20">
                        <Image src={logoSelector} w="225px" />
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
            <Box w={{ md: '100px', lg: '330px' }} h="75px" p="4" bottom="0" left="0" pos="fixed" bg={uiColor} verticalAlign="middle">
                <Flex wrap="wrap">
                    <Avatar src={props.accountInfo.picture ?? ''} name={props.accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" ml={{ md: 2, lg: 0 }} />
                    <VStack spacing="0" align="left" pl="2">
                        <HStack><Text fontSize="md">{props.accountInfo.name ?? 'Visitor'}</Text><Text as="b" fontSize="xs">{props.accountInfo.nip05 ?? ''}</Text></HStack>
                        <Text w="180px" noOfLines="1" fontSize="xs">{props.account ? props.account.publicKey : 'no pub key'}</Text>
                    </VStack>
                    <VStack align="right" w="60px">
                        <Menu>
                            <MenuButton as={Button} variant="ghost"><IoMdArrowDropup /></MenuButton>
                            <MenuList>
                                <MenuItem icon={<IoIosPerson/>}>Profile</MenuItem>
                                <MenuItem icon={<IoIosSettings/>}>Settings</MenuItem>
                                <MenuItem icon={colorMode.colorMode==='light'?<MoonIcon/>:<SunIcon/>} onClick={colorMode.toggleColorMode}>Toggle Color Mode</MenuItem>
                                <MenuDivider/>
                                <MenuItem onClick={logout.bind(this)} icon={<BiDoorOpen />}>Logout</MenuItem>
                            </MenuList>
                        </Menu>
                        {/*<Button variant="ghost" color="gray.400" onClick={colorMode.toggleColorMode}></Button>*/}
                    </VStack>
                </Flex>
            </Box>
        </Box>
    </Show>)
}

export default MenuBar;