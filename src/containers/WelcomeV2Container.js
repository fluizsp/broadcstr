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
            toast({ description: "Can't find extension!", status: "error" })

        window.nostr.getPublicKey().then(publicKeyHex => {
            let publicKey = nip19.npubEncode(publicKeyHex);
            dispatch(setAccount({ publicKey: publicKey }));
            dispatch(getMyInfo(publicKey));
            dispatch(saveToStorage());
            navigate('/');
        });
    }
    const keyLogin = () => {
        try{
        let privateKeyHex = nip19.decode(privateKey).data;
        let publicKey = nip19.npubEncode(getPublicKey(privateKeyHex));
        dispatch(setAccount({ publicKey: publicKey, privateKey: privateKey }));
        dispatch(getMyInfo(publicKey));
        dispatch(saveToStorage());
        navigate('/');
        } catch {
            toast({ description: "Error getting public key, check your key and try again!", status: "error" })
        }
    }

    return (
        <Fade in={true}>
            <LightMode>
                <Box textAlign="center">
                    <Box p={50}>
                        <VStack spacing="10">
                            <Image src={logo} w={['250px', '250px', '400px']} />
                            <Box width="400px" textAlign="center">
                                <Swiper
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    pagination={true}
                                    navigation={true}
                                    modules={[Navigation, Pagination]}>
                                    <SwiperSlide>
                                        {featureCard({ src: privacy, heading: 'Private!', text: "Your account doesn't require e-mails or phone numbers. Start just with your pair of keys;" })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: decentralized, heading: 'Decentralized!', text: "Censorship resistance means no Big Techs! You control where your consume and post information. Built on Nostr." })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: encrypted, heading: 'Encrypted!', text: "Content signed with YOUR private key! Messages encrypted with the same key. No one will ever get into your messages without your authorization. Ever" })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: value4value, heading: 'Value4Value', text: "Reward your favorite content with Bitcoin Lightning Network! Tip and stack sats;" })}
                                    </SwiperSlide>
                                </Swiper>
                            </Box>
                            <Box>
                                <Heading size="md" color="white">Start using Broadcstr:</Heading>
                                <Card mt="5" m="5" p="50px" bgGradient="linear(to-b, white 50%, gray.200 100%)" >
                                    <VStack gap={4} >
                                        <Heading size="md" color="green.400">Choose an username/handle:</Heading>
                                        <InputGroup>
                                            <InputLeftAddon color="blue.700" children="@" />
                                            <Input variant="outline" id="username" placeholder='handle' onBlur={(e) => setHandle(e.target.value)}></Input>
                                        </InputGroup>
                                        <Button bgGradient="linear(to-br, brand.purple, brand.green)" onClick={createAccount}>Go!</Button>
                                    </VStack>
                                </Card>
                                <Heading size="md" color="white">Already have keys?</Heading>
                                <Card mt="5" m="5" p="50px" bgGradient="linear(to-b, white 50%, gray.200 100%)" >
                                    <VStack gap={4}>
                                        <Heading size="md" color="green.400">Enter using:</Heading>
                                        <Button bgGradient="linear(to-br, brand.purple, brand.green)" leftIcon={<BrowsersOutline color="blue.700" />} onClick={extensionLogin}>Browser Extension</Button>
                                        <Button bgGradient="linear(to-br, brand.purple, brand.green)" leftIcon={<HiKey />} onClick={() => { setLoginPkey(!loginPKey) }}>Private Key</Button>
                                        <Collapse in={loginPKey}>
                                            <InputGroup>
                                                <InputLeftAddon color="blue.700" children="@" />
                                                <Input variant="outline" id="privateKey" type="password" placeholder='nsec...' onChange={e => { setPrivateKey(e.target.value) }}></Input>
                                            </InputGroup>
                                        </Collapse>
                                        <Collapse in={loginPKey}>
                                            <Button bgGradient="linear(to-br, brand.purple, brand.green)" onClick={keyLogin}>Go!</Button>
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