import {
    nip19,
} from 'nostr-tools'
import { getPoolService } from '../services/NostrRelayPoolService';

import { setAccount } from './account';

export const RECEIVED_NOTE = "RECEIVED_NOTE";
export const RECEIVED_USER_METADATA = "RECEIVED_USER_METADATA";
export const RECEIVED_NOTE_RELATED = "RECEIVED_NOTE_RELATED";
export const LOAD_NOTE_RELATED = "LOAD_NOTE_RELATED";
export const NOTE_RELATED_REQUESTED = "NOTE_RELATED_REQUESTED";
export const RECEIVED_USER_ID = "RECEIVED_USER_ID";
export const UNLOAD_NOTES = "UNLOAD_NOTES";
export const SET_FEED_TYPE = "SET_FEED_TYPE";
export const SET_LIMIT = "SET_LIMIT";
export const REMOVE_FOLLOWING = "REMOVE_FOLLOWING";
export const USER_FOLLOWING = "USER_FOLLOWING";
export const USER_FOLLOWER = "USER_FOLLOWER";
export const CLEAR_SEARCH = "CLEAR_SEARCH";
export const LOCATED_USER = "LOCATED_USER";
export const LOCATED_NOTE = "LOCATED_NOTE";
export const REPLY_TO = "REPLY_TO";
export const VIEW_IMAGE = "VIEW_IMAGE";
export const CLOSE_IMAGE = "CLOSE_IMAGE";

let requestedMetadatas = [];

export const receivedUserMetadata = (publicKey, userMetadata) => {
    return {
        type: RECEIVED_USER_METADATA,
        data: { publicKey: publicKey, userMetadata: userMetadata }
    }
}

export const getMyInfo = () => {
    return ((dispatch, getState) => {
        let publicKey = getState().user.account.publicKey;
        if (publicKey) {
            let metadataFilters = {
                kinds: [0],
                authors: [nip19.decode(publicKey).data]
            };
            let metadataSub = getPoolService().createSubscription(metadataFilters);//.then(results => {
            metadataSub.onEvent(event => {
                let accountInfo = JSON.parse(event.content);
                dispatch(setAccount(null, accountInfo));
            });
            let followingFilters = {
                kinds: [3],
                authors: [nip19.decode(publicKey).data]
            };
            let followingSub = getPoolService().createSubscription(followingFilters);//.then(results => {
            followingSub.onEvent(event => {
                let following = event.tags.map(t => {
                    return t[1]
                });
                dispatch(setAccount(null, null, following));
            });
            let likeFilters = {
                kinds: [3],
                authors: [nip19.decode(publicKey).data]
            };
            let likeSub = getPoolService().createSubscription(likeFilters);//.then(results => {
            likeSub.onEvent(event => {
                let likes = event.tags.map(t => {
                    return t[1];
                });
                dispatch(setAccount(null, null, null, likes));
            });
        }
    });
}

export const getUsersMetadata = () => {
    return ((dispatch, getState) => {
        let metadataBulk = [];
        let usersMetadata = getState().user.usersMetadata;
        let emptyUsersMetadata = [];
        Object.keys(usersMetadata).forEach(key => {
            if ((!usersMetadata[key].name || usersMetadata[key].load) && requestedMetadatas.indexOf(key) === -1)
                emptyUsersMetadata.push(key);
        });
        if (emptyUsersMetadata.length > 50)
            emptyUsersMetadata = emptyUsersMetadata.slice(0, 50);
        emptyUsersMetadata.forEach(key => {
            requestedMetadatas.push(key)
        });
        if (emptyUsersMetadata.length > 0) {
            let filters = {
                kinds: [0],
                authors: emptyUsersMetadata
            };
            let sub = getPoolService().createSubscription(filters);
            sub.onEvent(event => {
                let userMetadata = JSON.parse(event.content);
                userMetadata.load = false;
                userMetadata.created_at = event.created_at;
                userMetadata.pubkey = event.pubkey;
                metadataBulk.push(userMetadata);
                if (metadataBulk.length > 10) {
                    metadataBulk.forEach(userMetadata => {
                        dispatch(receivedUserMetadata(userMetadata.pubkey, userMetadata));
                    });
                    metadataBulk = [];
                }
            });
            sub.onEose(event => {
                metadataBulk.forEach(userMetadata => {
                    dispatch(receivedUserMetadata(userMetadata.pubkey, userMetadata));
                });
                metadataBulk = [];
            });
        }
    });
}
