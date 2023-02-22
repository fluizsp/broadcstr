import React, { useEffect } from 'react';
import {
    Box
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
import { connect } from 'react-redux';
import WelcomeContainer from './WelcomeContainer';
import AccountCreationContainer from './AccountCreationContainer';
import LoginContainer from './LoginContainer';
import NoteDetailContainer from './NoteDetailContainer';
import { logout } from '../actions/account';
import ProfileContainer from './ProfileContainer';
import SearchContainer from './SearchContainer';
import { getMyInfo } from '../actions/relay';
import SettingsContainer from './SettingsContainer';

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => {
            dispatch(logout());
        },
        loadMyInfo: (publicKey) => {
            dispatch(getMyInfo(publicKey));
        }
    };
};

const mapStateToProps = (state, ownProps) => {
    return {
        loggedIn: state.user.loggedIn,
        account: state.user.account,
        accountInfo: state.user.accountInfo ?? {},
        relays: state.user.relays
    };
}

const home = props => (
    <Box>
        <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
        <TopBar account={props.account} accountInfo={props.accountInfo}  relays={props.relays} />
        <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
        <HomeContainer />
    </Box>
)

const settings = props => (
    <Box>
        <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
        <TopBar account={props.account} accountInfo={props.accountInfo}  relays={props.relays} />
        <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
        <SettingsContainer />
    </Box>
)

const noteDetail = props => {
    return (
        <Box>
            <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
            <TopBar account={props.account} accountInfo={props.accountInfo} relays={props.relays} backLabel="Note" />
            <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
            <NoteDetailContainer />
        </Box>
    )
}
const profile = props => {
    return (
        <Box>
            <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
            <TopBar account={props.account} accountInfo={props.accountInfo} relays={props.relays}  backLabel="Profile" />
            <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
            <ProfileContainer />
        </Box>
    )
}

const search = props => {
    return (
        <Box>
            <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
            <TopBar account={props.account} accountInfo={props.accountInfo} relays={props.relays} backLabel="Search" />
            <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
            <SearchContainer />
        </Box>
    )
}

const AppContainer = (props) => {

    useEffect(() => {
        if (props.account && props.account.publicKey)
            props.loadMyInfo(props.account.publicKey);
    }, [props.account])
    return (<Box minH="100vH" bgGradient='linear(to-br, brand.purple, brand.green)'>
        <BrowserRouter>
            <Routes>
                <Route exact path="/welcome" element={<WelcomeContainer />} />
                <Route exact path="/welcome/create" element={<AccountCreationContainer />} />
                <Route exact path="/welcome/login" element={<LoginContainer />} />
                <Route exact path="/" element={home(props)} />
                <Route exact path="/settings/:area?" element={settings(props)} />
                <Route path="/note/:id" element={noteDetail(props)} />
                <Route exact path="/:id" element={profile(props)} />
                <Route path="/search/:term?" element={search(props)} />
            </Routes>
        </BrowserRouter>
    </Box>)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);