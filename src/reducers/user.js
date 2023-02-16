import { createReducer } from '@reduxjs/toolkit'
import { loadState } from '../localStorage';

let storageState = loadState('user');

const initialState = storageState ? storageState : {
    loggedIn: false,
    account: {},
    accountInfo: {},
    usersMetadata: {},
    likes: []
};

function removeEmpty(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null && v !== ""));
}


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
        if (action.data.following)
            state.following = action.data.following;
        if (action.data.likes)
            action.data.likes.forEach(l => {
                if (!state.likes || state.likes.indexOf(l)===-1)
                    state.likes === null ? state.likes = [l] : state.likes.push(l);
            });

    },
    RECEIVED_USER_METADATA: (state, action) => {
        let userMetadata = action.data.userMetadata;
        userMetadata = removeEmpty(userMetadata);
        state.usersMetadata[action.data.publicKey] = Object.assign({}, state.usersMetadata[action.data.publicKey], userMetadata);
    },
    LOGOUT: (state, action) => {
        state.loggedIn = false;
        state.account = {};
        state.accountInfo = {};
        state.usersMetadata = {};
        state.likes = []
    }
});

export default userReducer;