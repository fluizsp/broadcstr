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
    LightMode
} from '@chakra-ui/react';
import logo from '../LogoWelcome.png';
import { connect } from 'react-redux';
import { HiUserAdd } from 'react-icons/hi';
import withRouter from '../withRouter';
import privacy from '../privacy.png'
import decentralized from '../censorship-resistant.png'
import encrypted from '../encrypted.png'
import value4value from '../value4value.png'


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
    return (<Card ml="50px" mr="50px" p="50px" h="400px" bg="white" >
        <VStack gap={1} >
            <Image src={props.src} w="150px" />
            <Heading size="sm" color="green.400">{props.heading}</Heading>
            <Text>{props.text}</Text>
            {props.children}
        </VStack>
    </Card>)
}

class WelcomeContainer extends Component {
    render() {
        return (
            <Fade in={true}>
                <LightMode>
                    <Box textAlign="center" overflow="hidden" >
                        <Box p={50}>
                            <VStack spacing="10">
                                <Image src={logo} w={['250px', '250px', '400px']} />
                                <Box width="400px" textAlign="center">
                                    <Swiper
                                        spaceBetween={0}
                                        slidesPerView={1}
                                        pagination={true}
                                        navigation={true}
                                        modules={[Navigation, Pagination]}
                                    >
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
                                <VStack spacing="5">>
                                    <Button variant="solid" color="blue.700" size="lg" fontSize="md" leftIcon={<HiUserAdd color="blue.700" />} onClick={() => { this.props.router.navigate('/welcome/create') }}>Create account</Button>
                                    <Button variant="link" color="blue.700" size="lg" fontSize="md" onClick={() => { this.props.router.navigate('/welcome/login') }}>Start session</Button>
                                </VStack>
                            </VStack>
                        </Box>
                    </Box>
                </LightMode>
            </Fade >
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(WelcomeContainer))
