import { Flex, Center, Box, Image, VStack, Button, Avatar, Text, Show, Hide, Tooltip, HStack, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { FaHashtag, FaInfo } from 'react-icons/fa';
import { GoHome, GoSignIn } from 'react-icons/go';
import { IoMdSearch, IoIosSettings, IoMdArrowDropup, IoIosPerson, IoIosNotifications } from 'react-icons/io';
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../logo_h.svg';
import logoDark from '../logo_h_dark.svg';
import smallLogo from '../logo_small.svg';
import { useColorModeValue, useColorMode, } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

const MenuBar = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const intl = useIntl();
    const colorMode = useColorMode();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const logoSelector = useColorModeValue(logo, logoDark);
    const account = useSelector(state => state.user.account);
    const accountInfo = useSelector(state => state.user.accountInfo);
    function goHome() {
        window.scrollTo(0, 0);
        navigate('/');
    }
    return (<Show above="md">
        <Box w={{ md: '100px' }} h="100vh" p="40px" bg={uiColor}
            backdropFilter="auto" backdropBlur="6px" top="0" left="0" pos="fixed" zIndex="1"
            borderRight="1px" borderRightColor={uiColor}>
            <Center>
                {/*Desktop/Tablet Menu*/}
                <VStack spacing="20">
                    <Tooltip label={"Broadcstr: "+intl.formatMessage({ id: 'welcome.header' })} fontSize='md'>
                        <Image src={smallLogo} w="90px" />
                    </Tooltip>
                    <VStack spacing="8" >
                        <Tooltip label={intl.formatMessage({ id: 'home' })} fontSize='md'>
                            <Button variant="link" fontSize="2xl" color={location.pathname === "/" ? 'blue.300' : ''} onClick={goHome}><GoHome /></Button>
                        </Tooltip>
                        <Tooltip label={intl.formatMessage({ id: 'search' })} fontSize='md'>
                            <Button variant="link" fontSize="2xl" color={location.pathname.includes("/search") ? 'blue.300' : ''} onClick={() => { navigate('/search') }}><IoMdSearch /></Button>
                        </Tooltip>
                        <Tooltip label={intl.formatMessage({ id: 'discover' })} fontSize='md'>
                            <Button isDisabled variant="link"><FaHashtag /></Button>
                        </Tooltip>
                        <Tooltip label={intl.formatMessage({ id: 'about' })} fontSize='md'>
                            <Button variant="link" onClick={() => { navigate('/about') }} color={location.pathname.includes("/about") ? 'blue.300' : ''} fontSize="xl"><FaInfo /></Button>
                        </Tooltip>
                    </VStack>
                </VStack>
            </Center>
            {/* ACCOUNT */}
            <Box w={{ md: '100px' }} h="75px" p="4" bottom="0" left="0" pos="fixed" bg={uiColor} verticalAlign="middle">
                <Flex wrap="wrap">
                    <Button hidden={account.publicKey} variant="ghost" leftIcon={<GoSignIn />} onClick={() => { navigate('/welcome') }}>{intl.formatMessage({ id: 'signin' })}</Button>
                    <VStack align="right" w="60px">
                        <Menu>
                            <MenuButton as={Avatar} hidden={!account.publicKey} src={accountInfo.picture ?? ''} name={accountInfo.display_name ?? accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" ml="6px" cursor="pointer"></MenuButton>
                            <MenuList bg={uiColor}>
                                <MenuItem isDisabled={!account.publicKey} icon={<IoIosPerson />} onClick={() => { navigate(`/${accountInfo.nip05 ?? account.publicKey}`) }}>{intl.formatMessage({ id: 'profile' })}</MenuItem>
                                <MenuItem isDisabled={!account.publicKey} icon={<IoIosSettings />} onClick={() => { navigate('/settings') }}>{intl.formatMessage({ id: 'settings' })}</MenuItem>
                                <MenuItem icon={colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={colorMode.toggleColorMode}>{intl.formatMessage({ id: 'switchTo' }, { mode: colorMode.colorMode === 'light' ? intl.formatMessage({ id: 'dark' }) : intl.formatMessage({ id: 'light' }) })}</MenuItem>
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