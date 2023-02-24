import React from 'react';
import { Component } from 'react';
import {
    Box,
    VStack,
    Fade,
    Image,
    Button,
    Text,
    Heading,
    Card,
    Avatar,
    Input,
    InputGroup,
    InputLeftAddon,
    FormLabel,
    Textarea,
    HStack,
    Tooltip,
    LightMode
} from '@chakra-ui/react';
import logo from '../BadgeLogo.svg';
import { connect } from 'react-redux';
import { HiArrowCircleLeft, HiArrowCircleRight } from 'react-icons/hi';
import withRouter from '../withRouter';
import { generatePrivateKey, getPublicKey, nip19 } from 'nostr-tools';

// Import Swiper React components

// Import Swiper styles
import 'swiper/css';
import "swiper/css/navigation";
import "swiper/css/pagination";
import { saveToStorage, setAccount } from '../actions/account';



const mapDispatchToProps = (dispatch) => {
    return {
        setAccount: state => {
            let account = {
                publicKey: state.publicKey,
                privateKey: state.privateKey,
            };
            let accountInfo = {
                name: state.name
            };
            dispatch(setAccount(account, accountInfo));
        },
        setFollowing: following => {
            dispatch(setAccount(null,null,following));
        },
        saveToStorage: () => {
            dispatch(saveToStorage());
        }
    };
};

const mapStateToProps = (state, ownProps) => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
}

class AccountCreationContainer extends Component {
    state = { step: 1 }
    next() {
        if (this.state.step === 1) {
            if (!this.state.privateKey) {
                let privateKey = generatePrivateKey();
                let publicKey = getPublicKey(privateKey);
                privateKey = nip19.nsecEncode(privateKey);
                publicKey = nip19.npubEncode(publicKey);
                this.setState({ privateKey: privateKey, publicKey: publicKey });
            }
            this.setState({ step: 2 })
        }
        else {
            this.props.setAccount(this.state, null);
            this.props.setFollowing(['5bbb8e97d5c68afc68e46d7f858aefc73d161c85264fbfb99d91ed83bf1b9d23',
                '4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0',
                '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
                '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
                '52b4a076bcbbbdc3a1aefa3735816cf74993b1b8db202b01c883c58be7fad8bd',
                '3f770d65d3a764a9c5cb503ae123e62ec7598ad035d836e2a810f3877a745b24',
                '00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700',
                '6d21157c48d75f8a979552d9b1160f66bed66b76dd47886ddb914011c2da1841'])
            this.props.saveToStorage();
            this.props.router.navigate('/');
        }
    }
    previous() {
        this.setState({ step: 1 })
    }
    copyToClipboard(e) {
        this.setState({ copied: e.target.id });
        e.target.select();
        document.execCommand('copy');
    }
    render() {
        return (
            <Fade in={true}>
                <LightMode>
                    <Box textAlign="center" overflow="hidden">
                        <Box pt={50} minH="100vH" bgGradient='linear(to-br, brand.purple, brand.green)'>
                            <VStack spacing="8">
                                <Image src={logo} w="24" />
                                <Heading size="md" color="white">Let's set you up!</Heading>
                                <Fade in={this.state.step === 1} unmountOnExit={true}>
                                    <Card p="50px" w="350px" bg="whiteAlpha.200" textAlign="center">
                                        <VStack spacing="5">
                                            <Avatar name={this.state.name ?? 'Visitor'} size="md" />
                                            <FormLabel htmlFor='name' color="white">Handle:</FormLabel>
                                            <InputGroup>
                                                <InputLeftAddon color="blue.700" children="@" />
                                                <Input variant="solid" id="name" placeholder='handle' onChange={e => { this.setState({ name: e.target.value }) }}></Input>
                                            </InputGroup>
                                            <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiArrowCircleRight color="blue.700" />} onClick={this.next.bind(this)}>Next</Button>
                                        </VStack>
                                    </Card>
                                </Fade>
                                <Fade in={this.state.step === 2} unmountOnExit={true}>
                                    <Card p="50px" w="350px" bg="whiteAlpha.200" textAlign="center" color="white" mb="50px">
                                        <VStack spacing="5">
                                            <Avatar name={this.state.name ?? 'Visitor'} bg="blue.300" size="md" color="white" />
                                            <Heading size="md" color="white">Welcome to Broadcstr!</Heading>
                                            <FormLabel htmlFor='publicKey'>Your Public Key:</FormLabel>
                                            <Tooltip label="Copied to Clipboard!" isOpen={this.state.copied === "publicKey"} hasArrow={true}>
                                                <Textarea onClick={this.copyToClipboard.bind(this)} noOfLines={4} fontSize="sm" id="publicKey" isReadOnly={true} colorScheme="blue" value={this.state.publicKey} />
                                            </Tooltip>
                                            <Text fontSize="sm">Your public key is your account ID. You can share it with anyone so they can follow you.</Text>
                                            <FormLabel htmlFor='displayName'>Your Private Key:</FormLabel>
                                            <Tooltip label="Copied to Clipboard!" isOpen={this.state.copied === "privateKey"} hasArrow={true}>
                                                <Textarea onClick={this.copyToClipboard.bind(this)} noOfLines={2} fontSize="sm" id="privateKey" isReadOnly={true} colorScheme="blue" value={this.state.privateKey} />
                                            </Tooltip>
                                            <Text fontSize="sm">Your private key is your password. Save somewhere safe!.</Text>
                                            <HStack>
                                                <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiArrowCircleLeft color="blue.700" />} onClick={this.previous.bind(this)}>Back</Button>
                                                <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiArrowCircleRight color="blue.700" />} onClick={this.next.bind(this)}>Start Brodcsting</Button>
                                            </HStack>
                                        </VStack>
                                    </Card>
                                </Fade>
                            </VStack>
                        </Box>
                    </Box>
                </LightMode>
            </Fade >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AccountCreationContainer))
