import React from 'react';
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

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => {
            dispatch(logout());
        }
    };
};

const mapStateToProps = (state, ownProps) => {
    return {
        loggedIn: state.user.loggedIn,
        account: state.user.account,
        accountInfo: state.user.accountInfo ?? {}
    };
}

const home = props => (
    <Box>
        <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
        <TopBar account={props.account} accountInfo={props.accountInfo} />
        <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
        <HomeContainer />
    </Box>
)

const noteDetail = props => {
    return (
        <Box>
            <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
            <TopBar account={props.account} accountInfo={props.accountInfo} backLabel="Note" />
            <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
            <NoteDetailContainer />
        </Box>
    )
}
const profile = props => {
    return (
        <Box>
            <MenuBar account={props.account} accountInfo={props.accountInfo} logout={props.logout} />
            <TopBar account={props.account} accountInfo={props.accountInfo} backLabel="Profile" />
            <BottomNavigation account={props.account} accountInfo={props.accountInfo} />
            <ProfileContainer />
        </Box>
    )
}

const AppContainer = (props) => {
    return (<Box minH="100vH" bgGradient='linear(to-br, brand.purple, brand.green)'>
        <BrowserRouter>
            <Routes>
                <Route exact path="/welcome" element={<WelcomeContainer />} />
                <Route exact path="/welcome/create" element={<AccountCreationContainer />} />
                <Route exact path="/welcome/login" element={<LoginContainer />} />
                <Route exact path="/" element={home(props)} />
                <Route path="/note/:id" element={noteDetail(props)} />
                <Route path="/profile/:id" element={profile(props)} />
            </Routes>
        </BrowserRouter>
    </Box>)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);