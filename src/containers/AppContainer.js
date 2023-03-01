import React, { useEffect } from 'react';
import {
    Box, Center, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, useColorModeValue, VStack
} from '@chakra-ui/react';
import {
    Route,
    Routes,
    useNavigate
} from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import TopBar from '../components/TopBar';
import MenuBar from '../components/MenuBar';
import BottomNavigation from '../components/BottomNavigation';
import HomeContainer from './HomeContainer';
import { connect, useDispatch, useSelector } from 'react-redux';
import NoteDetailContainer from './NoteDetailContainer';
import { logout, saveToStorage } from '../actions/account';
import ProfileContainer from './ProfileContainer';
import SearchContainer from './SearchContainer';
import { getMyInfo, VIEW_IMAGE } from '../actions/relay';
import SettingsContainer from './SettingsContainer';
import EmbedNoteContainer from './EmbedNoteContainer';
import AboutContainer from './AboutContainer';
import WelcomeV2Container from './WelcomeV2Container';

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
            <TopBar backLabel="Note" />
            <BottomNavigation />
            <NoteDetailContainer />
        </Box>
    )
}
const profile = props => {
    return (
        <Box>
            <MenuBar />
            <TopBar backLabel="Profile" />
            <BottomNavigation />
            <ProfileContainer />
        </Box>
    )
}

const search = props => {
    return (
        <Box>
            <MenuBar />
            <TopBar  backLabel="Search" />
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
        <BrowserRouter>
            <Routes>
                <Route exact path="/welcome" element={<WelcomeV2Container />} />
                <Route exact path="/foryou"  element={home(props)} />
                <Route exact path="/" element={home(props)} />
                <Route exact path="/following" element={home(props)} />
                <Route exact path="/about" element={about(props)} />
                <Route exact path="/settings/:area?" element={settings(props)} />
                <Route path="/embed/:id" element={<EmbedNoteContainer />} />
                <Route path="/note/:id" element={noteDetail(props)} />
                <Route exact path="/:id" element={profile(props)} />
                <Route path="/search/:term?" element={search(props)} />

            </Routes>
        </BrowserRouter>
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