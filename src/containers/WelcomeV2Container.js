import { Box, Button, Card, Collapse, Fade, Heading, Image, Input, InputGroup, InputLeftAddon, LightMode, Text, useToast, VStack } from "@chakra-ui/react"

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

import logo from '../LogoWelcome.png';
import privacy from '../privacy.png'
import decentralized from '../censorship-resistant.png'
import encrypted from '../encrypted.png'
import value4value from '../value4value.png'

// Import Swiper styles
import 'swiper/css';
import "swiper/css/navigation";
import "swiper/css/pagination";
import { HiKey } from "react-icons/hi";
import { BrowsersOutline } from 'react-ionicons';
import { useState } from "react";
import { generatePrivateKey, getPublicKey, nip19 } from "nostr-tools";
import { useDispatch } from "react-redux";
import { saveToStorage, setAccount } from "../actions/account";
import { useNavigate } from "react-router";
import { getMyInfo } from "../actions/relay";
import { useIntl } from "react-intl";

const featureCard = (props) => {
    return (<Card ml="50px" mr="50px" p="50px" h="400px" bgGradient="linear(to-b, white 50%, gray.200 100%)" >
        <VStack gap={1} >
            <Image src={props.src} w="150px" />
            <Heading size="sm" color="green.400">{props.heading}</Heading>
            <Text>{props.text}</Text>
            {props.children}
        </VStack>
    </Card>)
}



const WelcomeV2Container = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const intl = useIntl();
    const toast = useToast()
    const [handle, setHandle] = useState();
    const [loginPKey, setLoginPkey] = useState(false);
    const [privateKey, setPrivateKey] = useState();
    const createAccount = () => {
        console.log(handle);

        let privateKey = generatePrivateKey();
        let publicKey = getPublicKey(privateKey);
        privateKey = nip19.nsecEncode(privateKey);
        publicKey = nip19.npubEncode(publicKey);
        dispatch(setAccount({ publicKey: publicKey, privateKey: privateKey }, { name: handle }, ['5bbb8e97d5c68afc68e46d7f858aefc73d161c85264fbfb99d91ed83bf1b9d23',
            '4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0',
            '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
            '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
            '52b4a076bcbbbdc3a1aefa3735816cf74993b1b8db202b01c883c58be7fad8bd',
            '3f770d65d3a764a9c5cb503ae123e62ec7598ad035d836e2a810f3877a745b24',
            '00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700',
            '6d21157c48d75f8a979552d9b1160f66bed66b76dd47886ddb914011c2da1841']));
        dispatch(saveToStorage());
        navigate('/');
    }

    const extensionLogin = () => {
        if (!window.nostr)
            toast({ description: intl.formatMessage({ id: 'welcome.errorExtension' }), status: "error" })

        window.nostr.getPublicKey().then(publicKeyHex => {
            let publicKey = nip19.npubEncode(publicKeyHex);
            dispatch(setAccount({ publicKey: publicKey }));
            dispatch(getMyInfo(publicKey));
            dispatch(saveToStorage());
            navigate('/');
        });
    }
    const keyLogin = () => {
        try {
            let publicKey = null;
            if (privateKey.includes('nsec')) {
                let privateKeyHex = nip19.decode(privateKey).data;
                publicKey = nip19.npubEncode(getPublicKey(privateKeyHex));
            } else if (privateKey.includes('npub')) {
                publicKey = privateKey;
                setPrivateKey(undefined);
            }
            dispatch(setAccount({ publicKey: publicKey, privateKey: privateKey.includes('npub') ? undefined : privateKey }));
            dispatch(getMyInfo(publicKey));
            dispatch(saveToStorage());
            navigate('/');
        } catch {
            toast({ description: intl.formatMessage({ id: 'welcome.errorPublicKey' }), status: "error" })
        }
    }

    return (
        <Fade in={true}>
            <LightMode>
                <Box textAlign="center">
                    <Box p={50}>
                        <VStack spacing="10">
                            <Image src={logo} w={['250px', '250px', '400px']} />
                            <Heading size="md" color="white">{intl.formatMessage({ id: 'welcome.header' })}</Heading>
                            <Box width="400px" textAlign="center">
                                <Swiper
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    pagination={true}
                                    navigation={true}
                                    modules={[Navigation, Pagination]}>
                                    <SwiperSlide>
                                        {featureCard({ src: privacy, heading: intl.formatMessage({ id: 'welcome.privacyTitle' }), text: intl.formatMessage({ id: 'welcome.privacyDescription' }) })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: decentralized, heading: intl.formatMessage({ id: 'welcome.decentralizedTitle' }), text: intl.formatMessage({ id: 'welcome.decentralizedDescription' }) })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: encrypted, heading: intl.formatMessage({ id: 'welcome.encryptedTitle' }), text: intl.formatMessage({ id: 'welcome.encryptedDescription' }) })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: value4value, heading: intl.formatMessage({ id: 'welcome.value4valueTitle' }), text: intl.formatMessage({ id: 'welcome.value4valueDescription' }) })}
                                    </SwiperSlide>
                                </Swiper>
                            </Box>
                            <Box>
                                <Heading size="md" color="white">{intl.formatMessage({ id: 'welcome.startUsing' })}</Heading>
                                <Card mt="5" m="5" p="50px" bgGradient="linear(to-b, white 50%, gray.200 100%)" >
                                    <VStack gap={4} >
                                        <Heading size="md" color="green.400">{intl.formatMessage({ id: 'welcome.chooseHandle' })}</Heading>
                                        <InputGroup>
                                            <InputLeftAddon color="blue.700" children="@" />
                                            <Input variant="outline" id="username" placeholder='handle' onBlur={(e) => setHandle(e.target.value)}></Input>
                                        </InputGroup>
                                        <Button bgGradient="linear(to-br, brand.purple, brand.green)" onClick={createAccount}>{intl.formatMessage({ id: 'welcome.go' })}</Button>
                                    </VStack>
                                </Card>
                                <Heading size="md" color="white">{intl.formatMessage({ id: 'welcome.haveKeys' })}</Heading>
                                <Card mt="5" m="5" p="50px" bgGradient="linear(to-b, white 50%, gray.200 100%)" >
                                    <VStack gap={4}>
                                        <Heading size="md" color="green.400">{intl.formatMessage({ id: 'welcome.enterUsing' })}</Heading>
                                        <Button bgGradient="linear(to-br, brand.purple, brand.green)" leftIcon={<BrowsersOutline color="blue.700" />} onClick={extensionLogin}>{intl.formatMessage({ id: 'welcome.browserExtension' })}</Button>
                                        <Button bgGradient="linear(to-br, brand.purple, brand.green)" leftIcon={<HiKey />} onClick={() => { setLoginPkey(!loginPKey) }}>{intl.formatMessage({ id: 'keys' })}</Button>
                                        <Collapse in={loginPKey}>
                                            <InputGroup>
                                                <InputLeftAddon color="blue.700" children="@" />
                                                <Input variant="outline" id="privateKey" type="password" placeholder='nsec... / npub...' onChange={e => { setPrivateKey(e.target.value) }}></Input>
                                            </InputGroup>
                                        </Collapse>
                                        <Collapse in={loginPKey}>
                                            <Button bgGradient="linear(to-br, brand.purple, brand.green)" onClick={keyLogin}>{intl.formatMessage({ id: 'welcome.go' })}</Button>
                                        </Collapse>
                                    </VStack>
                                </Card>
                            </Box>
                        </VStack>
                    </Box>
                </Box>
            </LightMode>
        </Fade >
    )
}

export default WelcomeV2Container;