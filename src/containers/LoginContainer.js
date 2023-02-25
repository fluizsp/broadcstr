import React from 'react';
import { Component } from 'react';
import {
    Box,
    VStack,
    Fade,
    Image,
    Button,
    Heading,
    Card,
    Avatar,
    Input,
    InputGroup,
    InputLeftAddon,
    FormLabel,
    LightMode
} from '@chakra-ui/react';
import logo from '../BadgeLogo.svg';
import { connect } from 'react-redux';
import { HiArrowCircleRight } from 'react-icons/hi';
import withRouter from '../withRouter';
import { getPublicKey, nip19 } from 'nostr-tools';

// Import Swiper React components

// Import Swiper styles
import 'swiper/css';
import "swiper/css/navigation";
import "swiper/css/pagination";
import { saveToStorage, setAccount } from '../actions/account';
import { getMyInfo } from '../actions/relay';
import { BrowsersOutline } from 'react-ionicons';



const mapDispatchToProps = (dispatch) => {
    return {
        setAccount: state => {
            let account = {
                publicKey: state.publicKey,
                privateKey: state.privateKey,
            }
            dispatch(setAccount(account, null, ['5bbb8e97d5c68afc68e46d7f858aefc73d161c85264fbfb99d91ed83bf1b9d23',
                '4523be58d395b1b196a9b8c82b038b6895cb02b683d0c253a955068dba1facd0',
                '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
                '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
                '52b4a076bcbbbdc3a1aefa3735816cf74993b1b8db202b01c883c58be7fad8bd',
                '3f770d65d3a764a9c5cb503ae123e62ec7598ad035d836e2a810f3877a745b24',
                '00000000827ffaa94bfea288c3dfce4422c794fbb96625b6b31e9049f729d700']));
        },
        loadAccountInfo: publicKey => {
            dispatch(getMyInfo(publicKey));
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

class LoginContainer extends Component {
    async next() {
        let privateKey = this.state.privateKey;
        let privateKeyHex = nip19.decode(privateKey);
        let publicKey = getPublicKey(privateKeyHex.data);
        publicKey = nip19.npubEncode(publicKey);
        await this.setState({
            publicKey: publicKey,
        });
        this.props.setAccount(this.state);
        this.props.loadAccountInfo(publicKey);
        this.props.saveToStorage();
        this.props.router.navigate('/');
    }
    async extensionLogin() {
        window.nostr.getPublicKey().then(publicKeyHex => {
            let publicKey = nip19.npubEncode(publicKeyHex);
            this.props.setAccount({ publicKey: publicKey });
            this.props.loadAccountInfo(publicKey);
            this.props.saveToStorage();
            this.props.router.navigate('/');
        });
    }
    render() {
        return (
            <Fade in={true}>
                <LightMode>
                    <Box textAlign="center" overflow="hidden">
                        <Box pt={50} minH="100vH" bgGradient='linear(to-br, brand.purple, brand.green)'>
                            <VStack spacing="8">
                                <Image src={logo} w="24" />
                                <Heading size="md" color="white">Start you session</Heading>
                                <Fade in={true}>
                                    <Card p="50px" w="350px" bg="whiteAlpha.200" textAlign="center" color="white">
                                        <VStack spacing="5">
                                            <Avatar name='Visitor' bg="blue.300" size="md" color="white" />
                                            <FormLabel htmlFor='privateKey'>Private Key:</FormLabel>
                                            <InputGroup>
                                                <InputLeftAddon color="blue.700" children="@" />
                                                <Input variant="filled" id="privateKey" type="password" placeholder='nsec...' onChange={e => { this.setState({ privateKey: e.target.value }) }}></Input>
                                            </InputGroup>
                                            <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiArrowCircleRight color="blue.700" />} onClick={this.next.bind(this)}>Next</Button>
                                            <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<BrowsersOutline color="blue.700" />} onClick={this.extensionLogin.bind(this)}>Enter with extension</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginContainer))
