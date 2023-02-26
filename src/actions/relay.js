import {
    relayInit,
    nip19,
    validateEvent,
    getEventHash,
    signEvent,
} from 'nostr-tools'
import { SimplePool } from 'nostr-tools';


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

const myPool = new SimplePool();
const requestedMetadatas = [];

export const receivedNote = (notes, lastId) => {
    //DEPRECATED
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

const getReadRelaysUrls = relays => {
    return relays.filter(r => r.read).map(r => { return r.url });
}

const getWriteRelaysUrls = relays => {
    return relays.filter(r => r.write).map(r => { return r.url });
}

const sign = async (event, account) => {
    return new Promise((resolve, reject) => {
        if (!account.privateKey) {
            window.nostr.signEvent(event).then(signedEvent => {
                resolve(signedEvent);
            }).catch(err => {
                reject(err);
            });
        } else if (account.privateKey) {
            event.sig = signEvent(event, nip19.decode(account.privateKey).data);
            resolve(event);
        }
    });

}

export const getFollowingFeed = (limit) => {
    return ((dispatch, getState) => {
        let eventBulk = [];
        if (getState().user.following && getState().user.following.length > 0) {
            let relays = getReadRelaysUrls(getState().user.relays);
            let filters = [{
                kinds: [1, 6],
                authors: getState().user.following,
                limit: 200
            }];
            let sub = myPool.sub(relays, filters);
            sub.on('event', async event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    eventBulk.push(event);
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        await dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            await dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    });
                    if (eventBulk.length > 10) {
                        eventBulk.forEach(event => {
                            dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                        });
                        eventBulk = [];
                    }
                }
            });
            sub.on('eose', () => {
                eventBulk.forEach(event => {
                    dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                });
                eventBulk = [];
                sub.unsub();
            })
        }
    });
}

export const getForYouFeed = (limit) => {
    return (dispatch, getState) => {
        let eventBulk = [];
        let following = getState().user.following;
        if (getState().user.following && getState().user.following.length > 0) {
            let relays = getReadRelaysUrls(getState().user.relays);
            let followingFilters = [{
                kinds: [1, 6],
                authors: following,
                limit: limit
            }];
            let followingSub = myPool.sub(relays, followingFilters);
            followingSub.on('event', async event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    eventBulk.push(event);
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        await dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            await dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    });
                    if (eventBulk.length > 10) {
                        eventBulk.forEach(event => {
                            dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                        });
                        eventBulk = [];
                    }
                }
            });
            followingSub.on('eose', () => {
                eventBulk.forEach(event => {
                    dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                });
                eventBulk = [];
                followingSub.unsub();
            })
            //TODO:following feed "as is" is the 1st return
            let secondLevelfollowingFilters = [{
                kinds: [3],
                authors: following,
                limit: limit
            }];
            let secondLevelFollowingList = [];
            myPool.list(relays, secondLevelfollowingFilters).then(results => {
                let totalTarget = 100;
                let perFollowingTarget = Math.ceil(totalTarget / results.length);
                results.forEach(following => {
                    let followingFollowing = following.tags.map(t => { return t[1] });
                    for (let takenCount = 0; takenCount < perFollowingTarget; takenCount++) {
                        let randomIndex = Math.floor((Math.random() * followingFollowing.length));
                        secondLevelFollowingList.push(followingFollowing[randomIndex]);
                        takenCount++;
                    }
                })
                secondLevelFollowingList = secondLevelFollowingList.filter(function (item, pos) {
                    return secondLevelFollowingList.indexOf(item) === pos;
                })
                let secondLevelNotesFilters = [{
                    kinds: [1],
                    authors: secondLevelFollowingList,
                    limit: limit
                }];
                let secondLevelNotesSub = myPool.sub(relays, secondLevelNotesFilters);
                secondLevelNotesSub.on('event', async event => {
                    if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                        eventBulk.push(event);
                        if (!getState().user.usersMetadata[event.pubkey]) {
                            await dispatch(receivedUserMetadata(event.pubkey, {}));
                        }
                        event.tags.forEach(async tag => {
                            if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                                await dispatch(receivedUserMetadata(tag[1], {}));
                            }
                        });
                        if (eventBulk.length > 10) {
                            eventBulk.forEach(event => {
                                dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                            });
                            eventBulk = [];
                        }
                    }
                });
                secondLevelNotesSub.on('eose', () => {
                    eventBulk.forEach(event => {
                        dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                    });
                    eventBulk = [];
                    secondLevelNotesSub.unsub();
                })
            });
            let secondLevelLikedFilters = [{
                kinds: [7],
                authors: following,
                limit: limit
            }];
            myPool.list(relays, secondLevelLikedFilters).then(results => {
                let likedNoteIds = [];
                results.forEach(liked => {
                    likedNoteIds.push(liked.tags.filter(t => t[0] === 'e').map(t => { return t[1] }));
                })
                likedNoteIds = likedNoteIds.flat().slice(0, limit);
                let likedNotesFilter = [{
                    kinds: [1],
                    ids: likedNoteIds,
                    limit: limit
                }];
                let likedNotesSub = myPool.sub(relays, likedNotesFilter);
                likedNotesSub.on('event', async event => {
                    if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                        eventBulk.push(event);
                        if (!getState().user.usersMetadata[event.pubkey]) {
                            await dispatch(receivedUserMetadata(event.pubkey, {}));
                        }
                        event.tags.forEach(async tag => {
                            if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                                await dispatch(receivedUserMetadata(tag[1], {}));
                            }
                        });
                        if (eventBulk.length > 10) {
                            eventBulk.forEach(event => {
                                dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                            });
                            eventBulk = [];
                        }
                    }
                });
                likedNotesSub.on('eose', () => {
                    eventBulk.forEach(event => {
                        dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                    });
                    eventBulk = [];
                    likedNotesSub.unsub();
                })
            });


        }
    }
}

export const getUserNotes = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let eventBulk = [];
        let relays = getReadRelaysUrls(getState().user.relays);
        let filters = [
            {
                kinds: [1, 6],
                authors: [publicKeyHex],
                limit: limit ?? 200
            }
        ];
        let sub = myPool.sub(relays, filters);
        sub.on('event', async event => {
            eventBulk.push(event);
            //dispatch(receivedNote(event));
            if (!getState().user.usersMetadata[event.pubkey]) {
                await dispatch(receivedUserMetadata(event.pubkey, {}));
            }
            event.tags.forEach(async tag => {
                if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                    await dispatch(receivedUserMetadata(tag[1], {}));
                }
            })
            if (eventBulk.length > 10) {
                eventBulk.forEach(event => {
                    dispatch({ type: RECEIVED_NOTE, data: { feedType: 'profile', notes: event } });
                });
                eventBulk = [];
            }
        });
        sub.on('eose', () => {
            eventBulk.forEach(event => {
                dispatch({ type: RECEIVED_NOTE, data: { feedType: 'profile', notes: event } });
            });
            eventBulk = [];
            sub.unsub();
        });
    });
}

export const getUserFollowing = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let relays = getReadRelaysUrls(getState().user.relays);
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
        let relays = getReadRelaysUrls(getState().user.relays);
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
        let relays = getReadRelaysUrls(getState().user.relays);
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

export const getMyInfo = () => {
    return ((dispatch, getState) => {
        let publicKey = getState().user.account.publicKey;
        if (publicKey) {
            let relays = getReadRelaysUrls(getState().user.relays);
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
            sub.on('eose', () => {
                sub.unsub();
            })
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
            let relays = getReadRelaysUrls(getState().user.relays);
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
            sub.on('eose', event => {
                metadataBulk.forEach(userMetadata => {
                    dispatch(receivedUserMetadata(userMetadata.pubkey, userMetadata));
                });
                metadataBulk = [];
                sub.unsub();
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
        let relays = getReadRelaysUrls(getState().user.relays);
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
        let relays = getReadRelaysUrls(getState().user.relays);
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
        });
        sub.on('eose', () => {
            sub.unsub();
        })
    });
}

export const publishNote = draftNote => {
    return (dispatch, getState) => {
        let event = {
            kind: 1,
            created_at: draftNote.created_at,
            tags: [],
            content: draftNote.content,
            pubkey: draftNote.pubkey
        };
        let mentionIndex = 0;
        if (draftNote.replyTo) {
            mentionIndex++;
            if (draftNote.replyTo.originalResponseTags && draftNote.replyTo.originalResponseTags.length > 0)
                draftNote.replyTo.originalResponseTags.forEach(rT => {
                    event.tags.push(['e', rT]);
                })
            event.tags.push(['e', draftNote.replyTo.note.id]);
            event.tags.push(['p', draftNote.replyTo.note.pubkey]);

        }
        if (draftNote.mentionTags)
            draftNote.mentionTags.forEach(m => {
                if (event.content.includes(m[0])) {
                    event.content = event.content.replace(m[0], `#[${mentionIndex}]`);
                    event.tags.push(['p', m[1]])
                    mentionIndex++;
                }
            })
        event.id = getEventHash(event)
        sign(event, getState().user.account).then(signedEvent => {
            let relaysUrls = getWriteRelaysUrls(getState().user.relays);
            let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });
        }).catch(err => {
            console.log(err);
        });

    }
}

export const likeNote = note => {
    return (dispatch, getState) => {
        let event = {
            kind: 7,
            created_at: Math.floor(new Date() / 1000),
            tags: [],
            content: '+',
            pubkey: nip19.decode(getState().user.account.publicKey).data
        };
        event.tags.push(['e', note.id]);
        event.id = getEventHash(event)
        sign(event, getState().user.account).then(signedEvent => {
            let relaysUrls = getWriteRelaysUrls(getState().user.relays);
            let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });
        }).catch(err => {
            console.log(err);
        });
        dispatch(setAccount(null, null, null, [note.id]));
    }
}

export const repostNote = note => {
    return (dispatch, getState) => {
        let event = {
            kind: 6,
            created_at: Math.floor(new Date() / 1000),
            tags: [],
            content: JSON.stringify(note),
            pubkey: nip19.decode(getState().user.account.publicKey).data
        };
        event.tags.push(['e', note.id]);
        event.id = getEventHash(event)
        sign(event, getState().user.account).then(signedEvent => {
            let relaysUrls = getWriteRelaysUrls(getState().user.relays);
            let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });
        }).catch(err => {
            console.log(err);
        });
        //dispatch({ type: RECEIVED_NOTE, data: { feedType: 'homeFeed', notes: event } });
    }
}
export const publishProfile = profile => {
    return (dispatch, getState) => {
        let event = {
            kind: 0,
            created_at: Math.floor(new Date() / 1000),
            tags: [],
            content: JSON.stringify(profile),
            pubkey: nip19.decode(getState().user.account.publicKey).data
        };
        event.id = getEventHash(event)
        sign(event, getState().user.account).then(signedEvent => {
            let relaysUrls = getWriteRelaysUrls(getState().user.relays);
            let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });
        }).catch(err => {
            console.log(err);
        });
    }
}

export const addFollowing = (publicKeyHex) => {
    return (dispatch, getState) => {
        let event = {
            kind: 3,
            created_at: Math.floor(new Date() / 1000),
            tags: [],
            content: "",
            pubkey: nip19.decode(getState().user.account.publicKey).data
        };
        let following = getState().user.following;
        following.forEach(f => {
            event.tags.push(['p', f]);
        })
        event.tags.push(['p', publicKeyHex]);
        event.id = getEventHash(event)
        sign(event, getState().user.account).then(signedEvent => {
            let relaysUrls = getWriteRelaysUrls(getState().user.relays);
            let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });
        }).catch(err => {
            console.log(err);
        });
        dispatch(setAccount(null, null, [publicKeyHex]));
    }
}

export const removeFollowing = (publicKeyHex) => {
    return (dispatch, getState) => {
        dispatch({ type: REMOVE_FOLLOWING, data: publicKeyHex });
    }
}

export const locatedNip05 = (publicKeyHex) => {
    return (dispatch, getState) => {
        let userMetadata = getState().user.usersMetadata[publicKeyHex];
        dispatch({ type: LOCATED_USER, data: { publicKeyHex: publicKeyHex, userMetadata: userMetadata ?? {} } })
    }
}