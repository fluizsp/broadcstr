import React from 'react';
import {
    Box, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, useColorModeValue, VStack
} from '@chakra-ui/react';
import {
    Route,
    Routes
} from 'react-router';
import { HashRouter } from 'react-router-dom';
import TopBar from '../components/TopBar';
import MenuBar from '../components/MenuBar';
import BottomNavigation from '../components/BottomNavigation';
import HomeContainer from './HomeContainer';
import { useDispatch, useSelector } from 'react-redux';
import NoteDetailContainer from './NoteDetailContainer';
import ProfileContainer from './ProfileContainer';
import SearchContainer from './SearchContainer';
import { VIEW_IMAGE } from '../actions/relay';
import SettingsContainer from './SettingsContainer';
import AboutContainer from './AboutContainer';
import WelcomeV2Container from './WelcomeV2Container';
import { useIntl } from 'react-intl';

const home = props => (
    <Box>
        <MenuBar />
        <TopBar />
        <BottomNavigation />
        <HomeContainer />
    </Box>
)

const about = props => (
    <Box>
        <MenuBar />
        <TopBar />
        <BottomNavigation />
        <AboutContainer />
    </Box>
)

const settings = props => (
    <Box>
        <MenuBar />
        <TopBar />
        <BottomNavigation />
        <SettingsContainer />
    </Box>
)

const noteDetail = props => {
    return (
        <Box>
            <MenuBar />
            <TopBar backLabel=" " />
            <BottomNavigation />
            <NoteDetailContainer />
        </Box>
    )
}
const profile = props => {
    return (
        <Box>
            <MenuBar />
            <TopBar backLabel=" " />
            <BottomNavigation />
            <ProfileContainer />
        </Box>
    )
}

const search = props => {
    return (
        <Box>
            <MenuBar />
            <TopBar backLabel=" " />
            <BottomNavigation />
            <SearchContainer />
        </Box>
    )
}

const AppContainer = (props) => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const dispatch = useDispatch();
    const imageSrc = useSelector(state => state.content.imageSrc);
    const closeImage = () => {
        dispatch({ type: VIEW_IMAGE, data: null });
    }
    return (<Box minH="100vH" bgGradient='linear(to-br, brand.purple, brand.green)'>
        <HashRouter>
            <Routes>
                <Route exact path="/welcome" element={<WelcomeV2Container />} />
                <Route exact path="/foryou" element={home(props)} />
                <Route exact path="/" element={home(props)} />
                <Route exact path="/following" element={home(props)} />
                <Route exact path="/about" element={about(props)} />
                <Route exact path="/settings/:area?" element={settings(props)} />
                <Route path="/note/:id" element={noteDetail(props)} />
                <Route exact path="/:id" element={profile(props)} />
                <Route path="/search/:term?" element={search(props)} />

            </Routes>
        </HashRouter>
        <Modal size="full" isOpen={imageSrc && imageSrc !== ""} bg="none" onClose={closeImage} closeOnEsc closeOnOverlayClick>
            <ModalOverlay />
            <ModalContent bg={uiColor}>
                <ModalCloseButton />
                <ModalBody p={0}>
                    <HStack h="100vH" textAlign="center">
                        <VStack w="100%">
                            <Image p={6} maxH="100vH" src={imageSrc} />
                        </VStack>
                    </HStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    </Box>)
}

export default AppContainer;