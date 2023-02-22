import {
    relayInit,
    nip19,
    validateEvent,
} from 'nostr-tools'
import { BroadcstrPool } from '../utils/BroadcstrPool';

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
export const SELECT_NOTES = "SELECT_NOTES";
export const SELECT_METADATA = "SELECT_METADATA";
export const REMOVE_FOLLOWING = "REMOVE_FOLLOWING";
export const USER_FOLLOWING = "USER_FOLLOWING";
export const USER_FOLLOWER = "USER_FOLLOWER";
export const CLEAR_SEARCH = "CLEAR_SEARCH";
export const LOCATED_USER = "LOCATED_USER";
export const LOCATED_NOTE = "LOCATED_NOTE";

const myPool = new BroadcstrPool();
const requestedMetadatas = [];

export const receivedNote = (notes, lastId) => {
    return {
        type: RECEIVED_NOTE,
        data: { notes: notes, lastId: lastId }
    }
}

export const receivedUserMetadata = (publicKey, userMetadata) => {
    return {
        type: RECEIVED_USER_METADATA,
        data: { publicKey: publicKey, userMetadata: userMetadata }
    }
}

export const receivedNoteRelated = (event) => {
    return {
        type: RECEIVED_NOTE_RELATED,
        data: { event: event }
    }
}

export const getFollowingFeed = (limit) => {
    return ((dispatch, getState) => {
        if (getState().user.following && getState().user.following.length > 0) {
            let relays = getState().user.relays.map(r => { return r.url });
            let filters = [{
                kinds: [1, 6],
                authors: getState().user.following,
                limit: 200
            }];
            let sub = myPool.sub(relays, filters);
            sub.on('event', async event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    dispatch(receivedNote(event));
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        await dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            await dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    });
                }
            });
        }
    });
}

export const getUserNotes = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let relays = getState().user.relays.map(r => { return r.url });
        let filters = [
            {
                kinds: [1, 6],
                authors: [publicKeyHex],
                limit: limit ?? 200
            }
        ];
        let sub = myPool.sub(relays, filters);
        sub.on('event', async event => {
            dispatch(receivedNote(event));
            if (!getState().user.usersMetadata[event.pubkey]) {
                await dispatch(receivedUserMetadata(event.pubkey, {}));
            }
            event.tags.forEach(async tag => {
                if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                    await dispatch(receivedUserMetadata(tag[1], {}));
                }
            })
        });
    });
}

export const getUserFollowing = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let relays = getState().user.relays.map(r => { return r.url });
        let filters = [
            {
                kinds: [3]
                , authors: [publicKeyHex],
                limit: limit ?? 1000
            }
        ];
        myPool.list(relays, filters).then(results => {
            results.forEach(event => {
                event.tags.forEach(t => {
                    if (t[0] === "p")
                        if (!getState().user.usersMetadata[t[1]]) {
                            dispatch(receivedUserMetadata(t[1], {}));
                        }
                })
                dispatch({ type: USER_FOLLOWING, data: event });
            });
        });
    })
}

export const getUserFollowers = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let followersBatch = [];
        let relays = getState().user.relays.map(r => { return r.url });
        let filters = [
            {
                kinds: [3],
                "#p": [publicKeyHex],
                limit: limit ?? 1000
            }
        ];
        let sub = myPool.sub(relays, filters);
        sub.on('event', event => {
            if (!getState().user.usersMetadata[event.pubkey]) {
                dispatch(receivedUserMetadata(event.pubkey, {}));
            }
            followersBatch.push({ type: USER_FOLLOWER, data: { publicKeyHex: publicKeyHex, follower: event.pubkey } });
            if (followersBatch.length > 100) {
                followersBatch.forEach(e => {
                    dispatch(e);
                })
                followersBatch = [];
            }
        });
        sub.on('eose', () => {
            if (followersBatch.length > 0) {
                followersBatch.forEach(e => {
                    dispatch(e);
                })
                followersBatch = [];
            }
        })
    });
}

export const getNote = (id) => {
    return ((dispatch, getState) => {
        if (getState().content.notes[id]) {
            dispatch(receivedNote(getState().content.notes[id], id));
            return;
        }
        let relays = getState().user.relays.map(r => { return r.url });
        let filters = [
            {
                kinds: [1, 6],
                ids: [id],
                limit: 1
            }
        ];
        myPool.list(relays, filters).then(results => {
            let event = results[0];
            if (validateEvent(event)) {
                dispatch(receivedNote(event, event.id));
                if (!getState().user.usersMetadata[event.pubkey]) {
                    dispatch(receivedUserMetadata(event.pubkey, {}));
                }
                event.tags.forEach(async tag => {
                    if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                        await dispatch(receivedUserMetadata(tag[1], {}));
                    }
                })
            }

        });
    });
}

export const getMyInfo = (publicKey) => {
    return ((dispatch, getState) => {
        if (publicKey) {
            let relays = getState().user.relays.map(r => { return r.url });
            let filters = [{
                kinds: [0, 3, 7],
                authors: [nip19.decode(publicKey).data]
            }];
            let sub = myPool.sub(relays, filters);//.then(results => {
            sub.on('event', event => {
                //results.forEach(event => {
                if (event.kind === 0) {
                    let accountInfo = JSON.parse(event.content);
                    dispatch(setAccount(null, accountInfo));
                }
                if (event.kind === 3) {
                    let following = event.tags.map(t => {
                        return t[1];
                    })
                    dispatch(setAccount(null, null, following));
                }
                if (event.kind === 7) {
                    let likes = event.tags.map(t => {
                        return t[1];
                    });
                    dispatch(setAccount(null, null, null, likes));
                }
                //});
            });/*.catch(err => {
                console.log(err);
            })*/
        }
    });
}

export const getUsersMetadata = () => {
    return ((dispatch, getState) => {
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
            let relays = getState().user.relays.map(r => { return r.url });
            let filters = [
                {
                    kinds: [0],
                    authors: emptyUsersMetadata
                }
            ];
            let sub = myPool.sub(relays, filters);
            sub.on('event', event => {
                let userMetadata = JSON.parse(event.content);
                userMetadata.load = false;
                dispatch(receivedUserMetadata(event.pubkey, userMetadata));
            });
        }
    });
}

export const addNoteRelatedToload = (id) => {
    return ((dispatch, getState) => {
        dispatch({
            type: LOAD_NOTE_RELATED,
            data: id
        });
    })
}

export const listNoteReplies = (id, limit) => {
    return ((dispatch, getState) => {
        console.log(`listNoteReplies for id:${id} `);
        let relays = getState().user.relays.map(r => { return r.url });
        let filters = [
            {
                kinds: [1]
                , "#e": [id]
                , limit: limit ?? 50
            }
        ];
        myPool.list(relays, filters).then(results => {
            results.forEach(event => {
                if (!getState().user.usersMetadata[event.pubkey]) {
                    dispatch(receivedUserMetadata(event.pubkey, {}));
                }
                event.tags.forEach(async tag => {
                    if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                        await dispatch(receivedUserMetadata(tag[1], {}));
                    }
                })
                dispatch(receivedNoteRelated(event));
            });
        });
    });
}

const performUserSearch = (term, userMetadata) => {
    let search = null;
    let searchRgx = new RegExp('(' + term + ')', 'gmi')
    if (userMetadata.name)
        search = searchRgx.exec(userMetadata.name);
    if (!search && userMetadata.display_name)
        search = searchRgx.exec(userMetadata.display_name);
    if (!search && userMetadata.nip05)
        search = searchRgx.exec(userMetadata.nip05);
    //if (!search && userMetadata.about)
    //    search = searchRgx.exec(userMetadata.about);
    return search;
}

const performContentSearch = (term, note) => {
    let search = null;
    let searchRgx = new RegExp('(' + term + ')', 'gmi')
    search = searchRgx.exec(note.content);
    return search;
}

export const search = (type, term) => {
    return ((dispatch, getState) => {
        console.log(`Search, type: ${type}, term:${term} `)
        let kinds = type === "users" ? [0] : [1, 6];
        if (type === "users") {
            let cachedUsers = getState().user.usersMetadata;
            Object.keys(cachedUsers).forEach(u => {
                if (performUserSearch(term, cachedUsers[u])) {
                    dispatch({ type: LOCATED_USER, data: { publicKeyHex: u, userMetadata: cachedUsers[u] } })
                }
            })
        }
        let relays = getState().user.relays.map(r => { return r.url });
        let filters = [
            {
                kinds: kinds,
                limit: 5000,
            }
        ];
        if (type === "notes")
            filters[0]["#t"] = [term];
        let sub = myPool.sub(relays, filters);
        sub.on('event', event => {
            if (type === "users") {
                let userMetadata = JSON.parse(event.content);
                if (performUserSearch(term, userMetadata)) {
                    if (validateEvent(event)) {
                        if (!getState().user.usersMetadata[event.pubkey]) {
                            dispatch(receivedUserMetadata(event.pubkey, userMetadata));
                        }
                        dispatch({ type: LOCATED_USER, data: { publicKeyHex: event.pubkey, userMetadata: userMetadata } })
                    }
                }
            } else {
                let note = event;
                if (event.kind === 6) {
                    note = JSON.parse(event.content);
                    note.reposted_by = event.pubkey;
                    note.created_at = event.created_at;
                }
                if (performContentSearch(term, note)) {
                    if (validateEvent(note)) {
                        if (!getState().user.usersMetadata[event.pubkey]) {
                            dispatch(receivedUserMetadata(event.pubkey, {}));
                        }
                        dispatch({ type: LOCATED_NOTE, data: note })
                    }
                }
            }
        })
    });
}

export const selectMetadatas = () => {
    return (dispatch, getState) => {
        dispatch({ type: SELECT_METADATA, data: getState().user.usersMetadata });
    }
}

export const addFollowing = (publicKeyHex) => {
    return (dispatch, getState) => {
        dispatch(setAccount(null, null, [publicKeyHex]));
    }
}

export const removeFollowing = (publicKeyHex) => {
    return (dispatch, getState) => {
        dispatch({ type: REMOVE_FOLLOWING, data: publicKeyHex });
    }
}