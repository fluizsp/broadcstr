import {
    nip19,
    validateEvent,
    getEventHash,
    signEvent,
} from 'nostr-tools'
import NostrRelayPoolService from '../services/NostrRelayPoolService';

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

let poolService = null;
let requestedMetadatas = [];
let requestedRelateds = [];

setInterval(() => {
    requestedRelateds = [];
}, 300000)

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

const getReadRelaysUrls = relays => {
    return relays.filter(r => r.read).map(r => { return r.url });
}

const getWriteRelaysUrls = relays => {
    return relays.filter(r => r.write).map(r => { return r.url });
}

export const initializeRelays = () => {
    return (dispatch, getState) => {
        poolService = new NostrRelayPoolService(getState().user.relays)
        poolService.initialize();
        poolService.addListener('open', relay => {
            console.log('pool relay opened');
        });
        poolService.addListener('close', relay => {
            console.log('pool relay closed');
        });
    }
}

export const sign = async (event, account) => {
    return new Promise((resolve, reject) => {
        try {
            if (!account.privateKey && window.nostr) {
                window.nostr.signEvent(event).then(signedEvent => {
                    resolve(signedEvent);
                }).catch(err => {
                    reject(err);
                });
            } else if (account.privateKey) {
                event.sig = signEvent(event, nip19.decode(account.privateKey).data);
                resolve(event);
            }
        } catch (err) {
            reject(err);
        };
    });
}

export const getFollowingFeed = (limit) => {
    return ((dispatch, getState) => {
        let eventBulk = [];
        if (getState().user.following && getState().user.following.length > 0) {
            let filters = {
                kinds: [1, 6],
                authors: getState().user.following,
                limit: limit
            };
            let sub = poolService.createSubscription(filters);
            sub.onEvent(event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {

                    eventBulk.push(event);
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    });
                    if (eventBulk.length > 10) {
                        eventBulk.forEach(event => {
                            dispatch(addNoteRelatedToload(event.id));
                            dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                        });
                        eventBulk = [];
                    }
                }
            });
            sub.onEose(() => {
                eventBulk.forEach(event => {
                    dispatch(addNoteRelatedToload(event.id));
                    dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                });
                eventBulk = [];
                //sub.unsub();
            });
        }
    });
}

export const getZapsFeed = (limit) => {
    return (dispatch, getState) => {
        let events = {};
        let zapsFilters = {
            kinds: [9735],
            limit: limit * 10
        };
        poolService.list(zapsFilters).then(results => {
            results.forEach(zap => {
                let zapInfo = {};
                let noteId = zap.tags.filter(t => t[0] === 'e')[0];
                if (noteId) {
                    noteId = noteId[1];
                    dispatch({ type: RECEIVED_NOTE_RELATED, data: zap });
                    let bolt11 = zap.tags.filter(t => t[0] === 'bolt11');
                    zapInfo.amount = 0;
                    if (bolt11[0]) {
                        const zapAmountRgx = /lnbc([0-9]+)([m|n|u|p])/;
                        let amount = zapAmountRgx.exec(bolt11[0][1]);
                        if (amount) {
                            zapInfo.amount = parseInt(amount[1]);
                            if (amount[2] === 'u')
                                zapInfo.amount = zap.amount * 100;
                            if (amount[2] === 'n')
                                zapInfo.amount = zap.amount / 10;
                        }
                    }
                    if (!events[noteId])
                        events[noteId] = zapInfo.amount;
                    else
                        events[noteId] = events[noteId] + zapInfo.amount;
                }
            })
            let eventList = Object.keys(events).map(k => { return { id: k, amount: events[k] } })
            eventList = eventList.sort((a, b) => { return a.amount > b.amount ? -1 : 1 })
            eventList = eventList.slice(0, limit * 2);
            let eventsFilters = {
                kinds: [1, 6],
                ids: eventList.map(e => { return e.id }),
                limit: limit * 2
            };
            poolService.list(eventsFilters).then(results => {
                results.forEach(event => {
                    if (events[event.id]) {
                        let eventWithZapAmount = Object.assign({}, event);
                        eventWithZapAmount.zapAmount = events[event.id];
                        if (eventWithZapAmount.zapAmount && validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                            if (!getState().user.usersMetadata[event.pubkey]) {
                                dispatch(receivedUserMetadata(event.pubkey, {}));
                            }
                            event.tags.forEach(async tag => {
                                if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                                    dispatch(receivedUserMetadata(tag[1], {}));
                                }
                            });
                            dispatch(addNoteRelatedToload(event.id));
                            dispatch({ type: RECEIVED_NOTE, data: { feedType: 'zaps', notes: eventWithZapAmount } });
                        }
                    }
                })
            });
        });
    }
}

export const getForYouFeed = (limit) => {
    return (dispatch, getState) => {
        let eventBulk = [];
        let following = getState().user.following;
        if (getState().user.following && getState().user.following.length > 0) {
            let followingFilters = {
                kinds: [1, 6],
                authors: following,
                limit: limit
            };
            let followingSub = poolService.createSubscription(followingFilters);
            followingSub.onEvent(async event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    eventBulk.push(event);
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    });
                    if (eventBulk.length > 10) {
                        eventBulk.forEach(event => {
                            addNoteRelatedToload(event.id);
                            dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                        });
                        eventBulk = [];
                    }
                }
            });
            followingSub.onEose(() => {
                eventBulk.forEach(event => {
                    addNoteRelatedToload(event.id);
                    dispatch({ type: RECEIVED_NOTE, data: { feedType: 'following', notes: event } });
                });
                eventBulk = [];
            })
            //TODO:following feed "as is" is the 1st return
            let secondLevelfollowingFilters = {
                kinds: [3],
                authors: following,
                limit: limit
            };
            let secondLevelFollowingList = [];
            poolService.list(secondLevelfollowingFilters).then(results => {
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
                let secondLevelNotesFilters = {
                    kinds: [1],
                    authors: secondLevelFollowingList,
                    limit: limit
                };
                let secondLevelNotesSub = poolService.createSubscription(secondLevelNotesFilters);
                secondLevelNotesSub.onEvent(async event => {
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
                                dispatch(addNoteRelatedToload(event.id));
                                dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                            });
                            eventBulk = [];
                        }
                    }
                });
                secondLevelNotesSub.onEose(() => {
                    eventBulk.forEach(event => {
                        dispatch(addNoteRelatedToload(event.id));
                        dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                    });
                    eventBulk = [];
                })
            });
            let secondLevelLikedFilters = {
                kinds: [7],
                authors: following,
                limit: limit
            };
            poolService.list(secondLevelLikedFilters).then(results => {
                let likedNoteIds = [];
                results.forEach(liked => {
                    likedNoteIds.push(liked.tags.filter(t => t[0] === 'e').map(t => { return t[1] }));
                })
                likedNoteIds = likedNoteIds.flat().slice(0, limit);
                let likedNotesFilter = {
                    kinds: [1],
                    ids: likedNoteIds,
                    limit: limit
                };
                let likedNotesSub = poolService.createSubscription(likedNotesFilter);
                likedNotesSub.onEvent(async event => {
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
                                dispatch(addNoteRelatedToload(event.id));
                                dispatch({ type: RECEIVED_NOTE, data: { feedType: 'foryou', notes: event } });
                            });
                            eventBulk = [];
                        }
                    }
                });
                likedNotesSub.onEose(() => {
                    eventBulk.forEach(event => {
                        dispatch(addNoteRelatedToload(event.id));
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
        let filters = {
            kinds: [1, 6],
            authors: [publicKeyHex],
            limit: limit ?? 15
        };
        let sub = poolService.createSubscription(filters);
        sub.onEvent(async event => {
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
                    dispatch(addNoteRelatedToload(event.id));
                    dispatch({ type: RECEIVED_NOTE, data: { feedType: 'profile', notes: event } });
                });
                eventBulk = [];
            }
        });
        sub.onEose(() => {
            eventBulk.forEach(event => {
                dispatch(addNoteRelatedToload(event.id));
                dispatch({ type: RECEIVED_NOTE, data: { feedType: 'profile', notes: event } });
            });
            eventBulk = [];
        });
    });
}

export const getUserFollowing = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let filters = {
            kinds: [3]
            , authors: [publicKeyHex],
            limit: limit ?? 1000
        };
        poolService.list(filters).then(results => {
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
    });
}

export const getUserFollowers = (publicKeyHex, limit) => {
    return ((dispatch, getState) => {
        let followersBatch = [];
        let filters = {
            kinds: [3],
            "#p": [publicKeyHex],
            limit: limit ?? 1000
        };
        let sub = poolService.createSubscription(filters);
        sub.onEvent(event => {
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
        sub.onEose(() => {
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
        if (getState().content.allNotes[id]) {
            dispatch(receivedNote(getState().content.allNotes[id], id));
            return;
        }
        let filters = {
            kinds: [1, 6],
            ids: [id],
            limit: 1
        };
        poolService.list(filters).then(results => {
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
            let metadataFilters = {
                kinds: [0],
                authors: [nip19.decode(publicKey).data]
            };
            let metadataSub = poolService.createSubscription(metadataFilters);//.then(results => {
            metadataSub.onEvent(event => {
                let accountInfo = JSON.parse(event.content);
                dispatch(setAccount(null, accountInfo));
            });
            let followingFilters = {
                kinds: [3],
                authors: [nip19.decode(publicKey).data]
            };
            let followingSub = poolService.createSubscription(followingFilters);//.then(results => {
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
            let likeSub = poolService.createSubscription(likeFilters);//.then(results => {
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
            let sub = poolService.createSubscription(filters);
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

export const addNoteRelatedToload = (id) => {
    return ((dispatch, getState) => {
        dispatch({
            type: LOAD_NOTE_RELATED,
            data: id
        });
    })
}

export const listNotesRelateds = () => {
    return (dispatch, getState) => {
        let notesRelatedsToLoad = [];
        Object.keys(getState().content.allNotesRelateds ?? {}).forEach(k => {
            if (getState().content.allNotesRelateds[k].load && !requestedRelateds.includes(k))
                notesRelatedsToLoad.push(k);
        })
        notesRelatedsToLoad.slice(0, 25);
        notesRelatedsToLoad.forEach(id => requestedRelateds.push(id));
        if (notesRelatedsToLoad.length > 0) {
            let filters = {
                kinds: [1, 6, 7, 9735],
                "#e": notesRelatedsToLoad,
                limit: 5000
            };
            poolService.list(filters).then(results => {
                results.forEach(event => {
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            await dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    })
                    dispatch({ type: RECEIVED_NOTE_RELATED, data: event });
                });
            })
        }
    }
}

export const listNoteRelateds = (id, limit) => {
    return ((dispatch, getState) => {
        console.log(`listNoteRelateds for id:${id} `);
        let filters = {
            kinds: [1, 6, 7, 9735],
            "#e": [id],
            limit: 5000
        };
        poolService.list(filters).then(results => {
            results.forEach(event => {
                if (!getState().user.usersMetadata[event.pubkey]) {
                    dispatch(receivedUserMetadata(event.pubkey, {}));
                }
                event.tags.forEach(async tag => {
                    if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                        await dispatch(receivedUserMetadata(tag[1], {}));
                    }
                })
                dispatch({ type: RECEIVED_NOTE_RELATED, data: event });
            });
        })
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
        let filters = {
            kinds: kinds,
            limit: 5000,
        };
        if (type === "notes")
            filters[0]["#t"] = [term];
        let sub = poolService.createSubscription(filters);
        sub.onEvent(event => {
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
        sub.onEose(() => {
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
            /*let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });*/
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
            /*let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });*/
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
            /*let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });*/
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
            /*let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });*/
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
            /*let pubs = myPool.publish(relaysUrls, signedEvent);
            pubs.forEach(pub => {
                pub.on('ok', () => {
                    console.log('Sucessfull published profile');
                });
            });*/
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