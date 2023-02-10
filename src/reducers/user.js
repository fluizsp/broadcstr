import { createReducer } from '@reduxjs/toolkit'
import { loadState } from '../localStorage';

let storageState = loadState('user');

const initialState = storageState ? storageState : {
    loggedIn: false,
    account: {},
    accountInfo: {}
};

const userReducer = createReducer(initialState, {
    SET_ACCOUNT: (state, action) => {
        if (action.data.account) {
            state.account = action.data.account;
            state.loggedIn = true;
        }

        if (action.data.accountInfo) {
            state.accountInfo = {
                name: action.data.accountInfo.name,
                nip05: action.data.accountInfo.nip05 ?? '',
                picture: action.data.accountInfo.picture ?? '',
                about: action.data.accountInfo.about ?? ''
            }
        }
    },
});

export default userReducer;