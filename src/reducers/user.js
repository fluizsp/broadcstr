import { createReducer } from '@reduxjs/toolkit'
import { saveToStorage } from '../actions/account';
import { loadState, saveState } from '../localStorage';

const initialState = {
    relays: loadState('user.relays') ?? [
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
        },
        {
            url: 'wss://eden.nostr.land',
            read: true,
            write: true
        },
        {
            url: 'wss://offchain.pub',
            read: true,
            write: true
        },
        {
            url: 'wss://relay.snort.social',
            read: true,
            write: true
        },
        {
            url: 'wss://nostr.relayer.se',
            read: true,
            write: true
        }
    ],
    loggedIn: false,
    account: loadState('user.account') ?? {},
    accountInfo: loadState('user.accountInfo') ?? {},
    usersMetadata: loadState('user.usersMetadata') ?? {},
    likes: loadState('user.likes') ?? [],
    language: loadState('user.language') ?? null,
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
        if (Object.keys(userMetadata).length > 1) {
            let created_incoming = userMetadata.created_at;
            let created_old = state.usersMetadata[action.data.publicKey] ? state.usersMetadata[action.data.publicKey].created_at : null;
            if (created_incoming < created_old)
                return;
        }
        state.usersMetadata[action.data.publicKey] = Object.assign({}, state.usersMetadata[action.data.publicKey], userMetadata);
    },
    LOGOUT: (state, action) => {
        state.loggedIn = false;
        state.account = {};
        state.accountInfo = {};
        state.likes = [];
        state.following = [];
        try {
            saveState({}, "user.account")
            saveState({}, "user.accountInfo")
            saveState({}, "user.likes")
        } catch { }
    },
    REMOVE_FOLLOWING: (state, action) => {
        if (state.following.indexOf(action.data) >= 0)
            state.following.splice(state.following.indexOf(action.data), 1)
    },
    SET_RELAYS: (state, action) => {
        if (action.data)
            state.relays = action.data;
    },
    SAVE_LANGUAGE: (state, action) => {
        state.language = action.data;
        saveState(action.data, "user.language")
    }
});

export default userReducer;