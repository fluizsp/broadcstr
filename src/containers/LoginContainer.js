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
    FormLabel
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
import { setAccount } from '../actions/account';
import { loadMyInfo } from '../actions/relay';



const mapDispatchToProps = (dispatch) => {
    return {
        setAccount: state => {
            let account = {
                publicKey: state.publicKey,
                privateKey: state.privateKey,
            }
            dispatch(setAccount(account));
        },
        loadAccountInfo: publicKey => {
            dispatch(loadMyInfo(publicKey));
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
        this.props.router.navigate('/');
    }
    render() {
        return (
            <Fade in={true}>
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
                                    </VStack>
                                </Card>
                            </Fade>
                        </VStack>
                    </Box>
                </Box>
            </Fade >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginContainer))
