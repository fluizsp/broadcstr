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
import { setAccount } from '../actions/account';



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
            this.props.setAccount(this.state);
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
                                    <Card p="50px" w="350px" bg="whiteAlpha.200" textAlign="center" color="white">
                                        <VStack spacing="5">
                                            <Avatar name='Visitor' bg="blue.300" size="md" color="white" />
                                            <FormLabel htmlFor='name'>Name:</FormLabel>
                                            <InputGroup>
                                                <InputLeftAddon color="blue.700" children="@" />
                                                <Input id="name" placeholder='yourname' onChange={e => { this.setState({ name: e.target.value }) }}></Input>
                                            </InputGroup>
                                            <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiArrowCircleRight color="blue.700" />} onClick={this.next.bind(this)}>Next</Button>
                                        </VStack>
                                    </Card>
                                </Fade>
                                <Fade in={this.state.step === 2} unmountOnExit={true}>
                                    <Card p="50px" w="350px" bg="whiteAlpha.200" textAlign="center" color="white" mb="50px">
                                        <VStack spacing="5">
                                            <Avatar name='Visitor' bg="blue.300" size="md" color="white" />
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
