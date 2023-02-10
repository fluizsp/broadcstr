import React from 'react';
import {
    Box
} from '@chakra-ui/react';
import {
    Route,
    Routes
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

const mapDispatchToProps = (dispatch) => {
    return {};
};

const mapStateToProps = (state, ownProps) => {
    return {
        loggedIn: state.user.loggedIn,
        account: state.user.account,
        accountInfo: state.user.accountInfo
    };
}

const home = props => (
    <Box>
        <MenuBar account={props.account} accountInfo={props.accountInfo} />
        <TopBar account={props.account} accountInfo={props.accountInfo}/>
        <BottomNavigation account={props.account} accountInfo={props.accountInfo}/>
        <HomeContainer />
    </Box>
)

const AppContainer = (props) => {
    return (<Box minH="100vH" bgGradient='linear(to-br, brand.purple, brand.green)'>
        <BrowserRouter>
            <Routes>
                <Route exact path="/welcome" element={<WelcomeContainer />} />
                <Route exact path="/welcome/create" element={<AccountCreationContainer />} />
                <Route exact path="/welcome/login" element={<LoginContainer />} />
                <Route exact path="/" element={home(props)} />
            </Routes>
        </BrowserRouter>
    </Box>)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)