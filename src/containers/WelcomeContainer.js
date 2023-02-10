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
    Card
} from '@chakra-ui/react';
import logo from '../BadgeLogo.svg';
import { connect } from 'react-redux';
import { HiUserAdd } from 'react-icons/hi';
import withRouter from '../withRouter';
import decentralized from '../decentralized.png'


// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import "swiper/css/navigation";
import "swiper/css/pagination";



const mapDispatchToProps = (dispatch) => {
    return {};
};

const mapStateToProps = (state, ownProps) => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
}

const featureCard = (props) => {
    return (<Card ml="50px" mr="50px" p="50px" h="400px" bg="whiteAlpha.200">
        <VStack color="white" >
            <Image src={props.src} w="150px" />
            <Heading size="sm" color="green.100">{props.heading}</Heading>
            <Text>{props.text}</Text>
            {props.children}
        </VStack>
    </Card>)
}

class WelcomeContainer extends Component {
    render() {
        return (
            <Fade in={true}>
                <Box textAlign="center" overflow="hidden">
                    <Box pt={50}>
                        <VStack spacing="10">
                            <Image src={logo} w="24" />
                            <Box width="400px" textAlign="center">
                                <Swiper
                                    spaceBetween={0}
                                    slidesPerView={1}
                                    pagination={true}
                                    navigation={true}
                                    modules={[Navigation, Pagination]}
                                >
                                    <SwiperSlide>
                                        {featureCard({ src: decentralized, heading: 'Privacy', text:"All acount data are optional. Start by just creaing a pair of keys."})}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: decentralized, heading: 'Decentralized!', children:<p>No Big Techs! You control where you consume and post information. <br/>Built on Nostr.</p>})}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: decentralized, heading: 'End to End Encryption!', text: "Encrypted messages that only you have the key, no one can break into your messages. Ever!" })}
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        {featureCard({ src: decentralized, heading: 'Earn Cryptocurrency!', text: "Liked your friends post? Tip it! And stack SATS with Bitcoin ⚡ network." })}
                                    </SwiperSlide>
                                </Swiper>
                            </Box>
                            <VStack spacing="5">>
                                <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiUserAdd color="blue.700" />} onClick={()=>{this.props.router.navigate('/welcome/create')}}>Create account</Button>
                                <Button variant="link" color="blue.700" size="lg" fontSize="md" onClick={()=>{this.props.router.navigate('/welcome/login')}}>Start session</Button>
                            </VStack>
                        </VStack>
                    </Box>
                </Box>
            </Fade >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(WelcomeContainer))
