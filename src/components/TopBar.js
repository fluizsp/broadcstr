import { Box, Image, Button, Tooltip, Hide, InputGroup, InputLeftElement, Input, Show, Collapse, Flex, Center, Container } from '@chakra-ui/react'
import { IoMdAddCircleOutline, IoMdNotifications, IoMdArrowBack, IoIosSearch, IoMdCloseCircle } from 'react-icons/io';
import { BiNetworkChart } from 'react-icons/bi';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useColorModeValue } from '@chakra-ui/react';


import logo from '../logo_h.svg';
import logoDark from '../logo_h_dark.svg';
import { useState } from 'react';
import Composer from './Composer';
import { useDispatch, useSelector } from 'react-redux';
import { REPLY_TO } from '../actions/relay';

const TopBar = (props) => {
    const dispatch = useDispatch();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const logoSelector = useColorModeValue(logo, logoDark);
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(null);
    const [composerActive, setComposerActive] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    let replyTo = useSelector(state => {
        return state.content.replyTo;
    });
    if (location.pathname === "/welcome")
        return null;
    const performSearch = () => {
        navigate(`/search/${searchTerm}`);
    }
    const openCloseComposer = () => {
        if (replyTo) {
            dispatch({ type: REPLY_TO, data: null });
        } else
            setComposerActive(!composerActive);
    }
    return (
        <Box w="100vW" borderBottomRadius={['xl', 'xl', '0']} ml={['0', '0', '100px', '330px']} bg={uiColor} backdropFilter="auto" backdropBlur="6px"
            top="0" left="0" pos="fixed" zIndex="1" pr={['0', '0', '110px', '340px']}
            borderBottom="1px" borderBottomColor={uiColor} dropShadow="lg">
            <Flex h="60px">
                <Box flex={1} p="3.5" >
                    {props.backLabel ?
                        <Button onClick={() => { navigate(-1) }} mt="-1" variant="ghost" leftIcon={<IoMdArrowBack />}>{props.backLabel}</Button>
                        :
                        <Box>
                            <Hide above="md" >
                                <Image src={logoSelector} w="130px" />
                            </Hide>
                            <Show above="md">
                                <InputGroup variant="unstyçed">
                                    <InputLeftElement children={<IoIosSearch />}></InputLeftElement>
                                    <Input bg="transparent" variant="unstyçed" placeholder='Search for users and notes...' onKeyUp={k => { setSearchTerm(k.target.value); if (k.key === "Enter") { performSearch() } }}></Input>
                                </InputGroup>
                            </Show>
                        </Box>
                    }
                </Box>
                <Box p="4" w="200px" textAlign="right">
                    <Tooltip label={`You are connected to ${props.relays.length} relays`} fontSize='md'>
                        <Button variant="ghost" color="blue.300" leftIcon={<BiNetworkChart />} onClick={() => { navigate('/settings/relays') }} size="sm" fontSize="xs">{props.relays.length}</Button>
                    </Tooltip>
                    <Tooltip label="What's on your mind?" fontSize='md'>
                        <Button variant="ghost" size="sm" fontSize="2xl" onClick={openCloseComposer}>{composerActive || replyTo ? <IoMdCloseCircle /> : <IoMdAddCircleOutline />}</Button>
                    </Tooltip>
                    <Tooltip label="Notifications (coming soon!)" fontSize='md'>
                        <Button variant="ghost" size="sm" isDisabled fontSize="2xl" ><IoMdNotifications /></Button>
                    </Tooltip>
                </Box>
            </Flex>
            <Collapse in={composerActive || replyTo} unmountOnExit>
                <Box p="3">
                    <Container maxW="4xl">
                        <Composer account={props.account} replyTo={replyTo} accountInfo={props.accountInfo} onPublish={openCloseComposer} />
                    </Container>
                </Box>
            </Collapse>
        </Box>
    )
}

export default TopBar;