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
        <Box w={{ md: '100px', lg: '330px' }} h="100vh" p="40px" bg={uiColor}
            backdropFilter="auto" backdropBlur="6px" top="0" left="0" pos="fixed" zIndex="1"
            borderRight="1px" borderRightColor={uiColor}>
            <Center>
                {/*Desktop Menu*/}
                <Show above="lg">
                    <VStack name="desktop1" spacing="20">
                        <Image src={logoSelector} w="225px" />
                        <VStack spacing="1">
                            <Button leftIcon={<GoHome />} variant="ghost" color={location.pathname === "/" ? 'blue.300' : ''} size="lg" onClick={goHome} >{intl.formatMessage({ id: 'home' })}</Button>
                            <Button leftIcon={<IoMdSearch />} variant="ghost" color={location.pathname.includes("/search") ? 'blue.300' : ''} size="lg" onClick={() => { navigate('/search') }}>{intl.formatMessage({ id: 'search' })}</Button>
                            <Tooltip label={intl.formatMessage({ id: 'comingSoon' })} fontSize='md'>
                                <Button leftIcon={<FaHashtag />} variant="ghost" isDisabled size="lg">{intl.formatMessage({ id: 'discover' })}</Button>
                            </Tooltip>
                            <Button leftIcon={<FaInfo />} variant="ghost" size="lg" onClick={() => { navigate('/about') }}>{intl.formatMessage({ id: 'about' })}</Button>
                        </VStack>
                    </VStack>
                </Show>
                {/*Tablet Menu*/}
                <Hide above="lg">
                    <VStack spacing="20">
                        <Image src={smallLogo} w="90px" />
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
                            <Tooltip label="Messages (coming soon!)" fontSize='md'>
                                <Button isDisabled variant="link" fontSize="2xl"><IoIosNotifications /></Button>
                            </Tooltip>
                        </VStack>
                    </VStack>
                </Hide>
            </Center>
            {/* ACCOUNT */}
            <Box w={{ md: '100px', lg: '330px' }} h="75px" p="4" bottom="0" left="0" pos="fixed" bg={uiColor} verticalAlign="middle">
                <Flex wrap="wrap">
                    <Button hidden={account.publicKey} variant="ghost" leftIcon={<GoSignIn />} onClick={()=>{navigate('/welcome')}}>{intl.formatMessage({ id: 'signin' })}</Button>
                    <Avatar hidden={!account.publicKey} src={accountInfo.picture ?? ''} name={accountInfo.display_name ?? accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" ml={{ md: 2, lg: 0 }} onClick={() => { navigate(`/${accountInfo.nip05 ?? account.publicKey}`) }} cursor="pointer"></Avatar>
                    <VStack hidden={!account.publicKey} spacing="0" align="left" pl="2">
                        <HStack>
                            <Text fontSize="md" maxW="180px" noOfLines={1}>{accountInfo.display_name ?? accountInfo.name ?? 'Nostr User'}</Text>
                            {/*<Text as="b" fontSize="xs">@{accountInfo.name ?? ''}</Text>*/}
                        </HStack>
                        <Text w="180px" noOfLines="1" fontSize="xs">{accountInfo.nip05 && accountInfo.nip05 !== '' ? accountInfo.nip05 : '@' + accountInfo.name}</Text>
                    </VStack>
                    <VStack align="right" w="60px">
                        <Menu >
                            <MenuButton as={Button} variant="ghost"><IoMdArrowDropup /></MenuButton>
                            <MenuList bg={uiColor}>
                                <MenuItem isDisabled={!account.publicKey} icon={<IoIosPerson />} onClick={() => { navigate(`/${accountInfo.nip05 ?? account.publicKey}`) }}>{intl.formatMessage({ id: 'profile' })}</MenuItem>
                                <MenuItem isDisabled={!account.publicKey} icon={<IoIosSettings />} onClick={() => { navigate('/settings') }}>{intl.formatMessage({ id: 'settings' })}</MenuItem>
                                <MenuItem icon={colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={colorMode.toggleColorMode}>{intl.formatMessage({ id: 'switchTo' }, { mode: colorMode.colorMode === 'light' ? intl.formatMessage({ id: 'dark' }) : intl.formatMessage({ id: 'light' })})}</MenuItem>
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