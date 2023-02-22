import { createReducer } from '@reduxjs/toolkit'
import { loadState } from '../localStorage';

let storageState = loadState('user');

const initialState = storageState ? storageState : {
    //relays: ['wss://relay.nostr.info', 'wss://relay.damus.io', 'wss://nostr-pub.wellorder.net', 'wss://nostr-pub.semisol.dev'],
    relays: [
        {
            url: 'wss://relay.nostr.info',
            read: true,
            write: true
        },
        {
            url: 'wss://relay.damus.io',
            read: true,
            write: true
        },
        {
            url: 'wss://nostr-pub.wellorder.net',
            read: true,
            write: true
        },
        {
            url: 'wss://nostr-pub.semisol.dev',
            read: true,
            write: true
        }
    ],
    loggedIn: false,
    account: {},
    accountInfo: {},
    usersMetadata: {},
    likes: [],
    following: []
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
                display_name: action.data.accountInfo.display_name,
                lud16: action.data.accountInfo.lud16,
                nip05: action.data.accountInfo.nip05,
                picture: action.data.accountInfo.picture,
                banner: action.data.accountInfo.banner,
                about: action.data.accountInfo.about
            }
        }
        if (action.data.following)
            action.data.following.forEach(f => {
                if (state.following.indexOf(f) === -1)
                    state.following.push(f);
            })

        if (action.data.likes)
            action.data.likes.forEach(l => {
                if (!state.likes || state.likes.indexOf(l) === -1)
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
        state.likes = [];
        state.following = [];
    },
    REMOVE_FOLLOWING: (state, action) => {
        if (state.following.indexOf(action.data) >= 0)
            state.following.splice(state.following.indexOf(action.data), 1)
    },
    SET_RELAYS: (state, action) => {
        if (action.data)
            state.relays = action.data;
    }
});

export default userReducer;