import { Flex, Center, Box, Image, VStack, Button, Avatar, Text, Link, Show, Hide, Tooltip, HStack, Menu, MenuButton, MenuItem, MenuList, MenuDivider } from '@chakra-ui/react'
import { FaHashtag, FaInfo, FaSignOutAlt } from 'react-icons/fa';
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
import { FiMessageSquare } from 'react-icons/fi';

const MenuBar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const colorMode = useColorMode();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const logoSelector = useColorModeValue(logo, logoDark);
    function goSplash() {
        navigate('/welcome');
    }
    function logout() {
        props.logout();
        navigate('/welcome');
    }

    function goHome() {
        window.scrollTo(0, 0);
        navigate('/');
    }
    if (!props.account || !props.account.publicKey)
        navigate('/welcome');
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
                            <Button leftIcon={<GoHome />} variant="ghost" color={location.pathname === "/" ? 'blue.300' : ''} size="lg" onClick={goHome} >Home</Button>
                            <Button leftIcon={<IoMdSearch />} variant="ghost" color={location.pathname.includes("/search") ? 'blue.300' : ''} size="lg" onClick={() => { navigate('/search') }}>Search</Button>
                            <Tooltip label="Coming soon!" fontSize='md'>
                                <Button leftIcon={<FaHashtag />} variant="ghost" isDisabled size="lg">Discover</Button>
                            </Tooltip>
                            <Tooltip label="Messages (coming soon!)" fontSize='md'>
                                <Button isDisabled leftIcon={<FiMessageSquare />} variant="ghost" size="lg">Messages</Button>
                            </Tooltip>
                            <Button leftIcon={<FaInfo />} variant="ghost" size="lg" onClick={() => { navigate('/about') }}>About</Button>
                        </VStack>
                    </VStack>
                </Show>
                {/*Tablet Menu*/}
                <Hide above="lg">
                    <VStack spacing="20">
                        <Image src={smallLogo} w="90px" />
                        <VStack spacing="8" >
                            <Tooltip label="Home" fontSize='md'>
                                <Button variant="link" fontSize="2xl" color={location.pathname === "/" ? 'blue.300' : ''} onClick={goHome}><GoHome /></Button>
                            </Tooltip>
                            <Tooltip label="Search" fontSize='md'>
                                <Button variant="link" fontSize="2xl" color={location.pathname.includes("/search") ? 'blue.300' : ''} onClick={() => { navigate('/search') }}><IoMdSearch /></Button>
                            </Tooltip>
                            <Tooltip label="Discover (coming soon!)" fontSize='md'>
                                <Button isDisabled variant="link"><FaHashtag /></Button>
                            </Tooltip>
                            <Tooltip label="Messages (coming soon!)" fontSize='md'>
                                <Button isDisabled variant="link" fontSize="2xl"><FiMessageSquare /></Button>
                            </Tooltip>
                        </VStack>
                    </VStack>
                </Hide>
            </Center>
            {/* ACCOUNT */}
            <Box w={{ md: '100px', lg: '330px' }} h="75px" p="4" bottom="0" left="0" pos="fixed" bg={uiColor} verticalAlign="middle">
                <Flex wrap="wrap">
                    <Avatar src={props.accountInfo.picture ?? ''} name={props.accountInfo.display_name ?? props.accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" ml={{ md: 2, lg: 0 }} onClick={() => { navigate(`/${props.accountInfo.nip05 ?? props.account.publicKey}`) }} cursor="pointer"></Avatar>
                    <VStack spacing="0" align="left" pl="2">
                        <HStack>
                            <Text fontSize="md">{props.accountInfo.display_name ?? props.accountInfo.name ?? 'Nostr User'}</Text>
                            <Text as="b" fontSize="xs">@{props.accountInfo.name ?? ''}</Text>
                        </HStack>
                        <Text w="180px" noOfLines="1" fontSize="xs">{props.accountInfo.nip05 && props.accountInfo.nip05 !== '' ? props.accountInfo.nip05 : props.account.publicKey}</Text>
                    </VStack>
                    <VStack align="right" w="60px">
                        <Menu>
                            <MenuButton as={Button} variant="ghost"><IoMdArrowDropup /></MenuButton>
                            <MenuList>
                                <MenuItem icon={<IoIosPerson />} onClick={() => { navigate(`/${props.accountInfo.nip05 ?? props.account.publicKey}`) }}>Profile</MenuItem>
                                <MenuItem icon={<IoIosSettings />} onClick={() => { navigate('/settings') }}>Settings</MenuItem>
                                <MenuItem icon={colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={colorMode.toggleColorMode}>Switch to {colorMode.colorMode === 'light' ? 'dark' : 'light'} Mode</MenuItem>
                                <MenuDivider />
                                <MenuItem onClick={logout.bind(this)} icon={<FaSignOutAlt />}>Sign out</MenuItem>
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