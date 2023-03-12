import { getEventHash, nip19, signEvent, validateEvent } from "nostr-tools";
import { setAccount } from "../actions/account";
import { receivedUserMetadata, RECEIVED_NOTE_RELATED, REMOVE_FOLLOWING } from "../actions/relay";
import { getNoteModel } from "../model/NoteModel";
import store from "../store";
import { getPoolService } from "./NostrRelayPoolService";

const addMetadataToLoad = publicKeyHex => {
    if (!store.getState().user.usersMetadata[publicKeyHex]) {
        store.dispatch(receivedUserMetadata(publicKeyHex, {}));
    }
}

const uniqueAndRepleaceble = events => {
    events = events.map(e => { return { ...e, dTag: e.tags.find(([t, v]) => t === 'd') } });
    events = events.map(e => { return { ...e, dTag: e.dTag ? e.dTag[1] : null } });
    let repleacebleEvents = events.filter(e => e.dTag);
    repleacebleEvents = repleacebleEvents.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 });
    let nonRepleacebleEvents = events.filter(e => !e.dTag);
    let replacedEvents = {};
    let uniqueEvents = [];
    nonRepleacebleEvents.forEach(event => {
        if (uniqueEvents.filter(e => e.id === event.id).length === 0)
            uniqueEvents.push(event);
    });
    repleacebleEvents.forEach(event => {
        if (!replacedEvents[event.dTag]) {
            replacedEvents[event.dTag] = event;
        } else {
            if (replacedEvents[event.dTag].pubkey === event.pubkey)
                replacedEvents[event.dTag] = event;
        }
    })
    uniqueEvents.push(Object.keys(replacedEvents).map(k => replacedEvents[k]));
    uniqueEvents = uniqueEvents.flat();

    return uniqueEvents;
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

export const getUserNotes = (publicKeyHex, limit, onNotes) => {
    let eventBulk = [];
    let filters = {
        kinds: [1, 6],
        authors: [publicKeyHex],
        limit: limit ?? 15
    };
    let sub = getPoolService().createSubscription(filters);
    sub.onEvent(event => {
        if (eventBulk.filter(e => e.id === event.id).length === 0)
            eventBulk.push(event);
        if (!store.getState().user.usersMetadata[event.pubkey]) {
            store.dispatch(receivedUserMetadata(event.pubkey, {}));
        }
        event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
            addMetadataToLoad(v);
        })
        if (eventBulk.length > 10) {
            onNotes(eventBulk.map(e => getNoteModel(e)));
            eventBulk = [];
        }
    });
    sub.onEose(() => {
        onNotes(eventBulk.map(e => getNoteModel(e)));
        eventBulk = [];
    });
}
export const getUserFollowing = (publicKeyHex, limit) => {
    return new Promise((resolve, reject) => {
        let filters = {
            kinds: [3]
            , authors: [publicKeyHex],
            limit: limit ?? 1000
        };
        getPoolService().list(filters).then(results => {
            results.forEach(event => {
                event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                    addMetadataToLoad(v);
                })
                resolve(event);
            });
        });
    })
}
export const getUserFollowers = (publicKeyHex, limit, onEvents) => {
    let followersBatch = [];
    let filters = {
        kinds: [3],
        "#p": [publicKeyHex],
        limit: limit ?? 1000
    };
    let sub = getPoolService().createSubscription(filters);

    sub.onEvent(event => {
        if (!store.getState().user.usersMetadata[event.pubkey]) {
            store.dispatch(receivedUserMetadata(event.pubkey, {}));
        }
        followersBatch.push(event.pubkey);
        if (followersBatch.length > 100) {
            onEvents(followersBatch);
            followersBatch = [];
        }
    });
    sub.onEose(() => {
        onEvents(followersBatch);
        followersBatch = [];
    })
}
export const getUserProfileBadges = async (publicKeyHex, limit, onResults) => {
    let filters = {
        kinds: [30008],
        authors: [publicKeyHex],
        limit: limit ?? 1000
    };
    let sub = getPoolService().createSubscription(filters, { life: 1000 });
    sub.onEvent(async event => {
        let badgeNames = []
        badgeNames = event.tags.filter(([t, v]) => t === 'a').map(([t, v]) => { return v.split(':')[2] });
        badgeNames = Array.from(new Set(badgeNames).values());
        let awardsIds = event.tags.filter(([t, v]) => t === 'e').map(([t, v]) => { return v });;
        awardsIds = Array.from(new Set(awardsIds).values());
        let badgesFilters = {
            kinds: [30009],
            '#d': badgeNames,
            limit: limit ?? 1000
        };
        let awardsFilters = {
            kinds: [8],
            ids: awardsIds,
            limit: limit ?? 1000
        };
        let awards = await getPoolService().list(awardsFilters, { timeout: 500 });
        let uniqueAwards = uniqueAndRepleaceble(awards);
        let badges = await getPoolService().list(badgesFilters, { timeout: 500 });
        let uniqueBadges = uniqueAndRepleaceble(badges);
        let results = [];
        uniqueAwards = uniqueAwards.map(award => { return { ...award, dTag: award.tags.find(([t, v]) => t === 'a') ? award.tags.find(([t, v]) => t === 'a')[1].split(':')[2] : null } })
        uniqueAwards.forEach(award => {
            let matchingBadge = uniqueBadges.find(b => b.dTag === award.dTag && b.pubkey === award.pubkey)
            if (matchingBadge)
                results.push({ badge: matchingBadge, award: award });
        })
        onResults(results);
    });
}

export const getZapsFeed = (limit, onResults) => {
    let events = {};
    let zapsFilters = {
        kinds: [9735],
        limit: limit * 5
    };
    getPoolService().list(zapsFilters, { timeout: 500 }).then(results => {
        console.log(results.length)
        results.forEach(zap => {
            let zapAmount = 0;
            let noteId = zap.tags.filter(t => t[0] === 'e')[0];
            if (noteId) {
                noteId = noteId[1];
                store.dispatch({ type: RECEIVED_NOTE_RELATED, data: zap });
                let bolt11 = zap.tags.filter(t => t[0] === 'bolt11');
                zapAmount = 0;
                if (bolt11[0]) {
                    const zapAmountRgx = /lnbc([0-9]+)([m|n|u|p])/;
                    let amount = zapAmountRgx.exec(bolt11[0][1]);
                    if (amount) {
                        zapAmount = parseInt(amount[1]);
                        if (amount[2] === 'u')
                            zapAmount = zapAmount * 100;
                        if (amount[2] === 'n')
                            zapAmount = zapAmount / 10;
                    }
                }
                if (!events[noteId])
                    events[noteId] = zapAmount;
                else
                    events[noteId] = events[noteId] + zapAmount;
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
        let sub = getPoolService().createSubscription(eventsFilters);
        sub.onEvent(event => {
            let notes = [];
            if (events[event.id]) {
                let model = getNoteModel(event);
                model.zapAmount = events[event.id];
                if (model.zapAmount && validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    addMetadataToLoad(event.pubkey);
                    event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                        addMetadataToLoad(v);
                    });
                    notes.push(model);
                }
            }
            onResults(notes);
        })
    });
}

export const getFollowingFeed = (limit, onResults) => {
    let notes = [];
    if (store.getState().user.following && store.getState().user.following.length > 0) {
        let filters = {
            kinds: [1, 6],
            authors: store.getState().user.following,
            limit: limit
        };
        let sub = getPoolService().createSubscription(filters);
        sub.onEvent(event => {
            if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                notes.push(getNoteModel(event));
                if (!store.getState().user.usersMetadata[event.pubkey]) {
                    store.dispatch(receivedUserMetadata(event.pubkey, {}));
                }
                event.tags.forEach(async tag => {
                    if (tag[0] === 'p' && !store.getState().user.usersMetadata[tag[1]]) {
                        store.dispatch(receivedUserMetadata(tag[1], {}));
                    }
                });
                if (notes.length > 10) {
                    onResults(notes);
                    notes = [];
                }
            }
        });
        sub.onEose(() => {
            onResults(notes);
            notes = [];
        });
    }
}

export const getForYouFeed = (limit, onResults) => {
    let notes = [];
    let following = store.getState().user.following;
    if (store.getState().user.following && store.getState().user.following.length > 0) {
        let followingFilters = {
            kinds: [1, 6],
            authors: following,
            limit: limit
        };
        let followingSub = getPoolService().createSubscription(followingFilters);
        followingSub.onEvent(async event => {
            if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                notes.push(getNoteModel(event));
                addMetadataToLoad(event.pubkey);
                event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                    addMetadataToLoad(v);
                });
                if (notes.length > 10) {
                    onResults(notes)
                    notes = [];
                }
            }
        });
        followingSub.onEose(() => {
            onResults(notes)
            notes = [];
        })
        let secondLevelfollowingFilters = {
            kinds: [3],
            authors: following,
            limit: limit
        };
        let secondLevelFollowingList = [];
        getPoolService().list(secondLevelfollowingFilters).then(results => {
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
            let secondLevelNotesSub = getPoolService().createSubscription(secondLevelNotesFilters);
            secondLevelNotesSub.onEvent(async event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    notes.push(getNoteModel(event));
                    addMetadataToLoad(event.pubkey);
                    event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                        addMetadataToLoad(v);
                    });
                    if (notes.length > 10) {
                        onResults(notes);
                        notes = [];
                    }
                }
            });
            secondLevelNotesSub.onEose(() => {
                onResults(notes);
                notes = [];
            })
        });
        let secondLevelLikedFilters = {
            kinds: [7],
            authors: following,
            limit: limit
        };
        getPoolService().list(secondLevelLikedFilters).then(results => {
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
            let likedNotesSub = getPoolService().createSubscription(likedNotesFilter);
            likedNotesSub.onEvent(async event => {
                if (validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    notes.push(getNoteModel(event));
                    addMetadataToLoad(event.pubkey);
                    event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                        addMetadataToLoad(v)
                    });
                    if (notes.length > 10) {
                        onResults(notes);
                        notes = [];
                    }
                }
            });
            likedNotesSub.onEose(() => {
                onResults(notes);
                notes = [];
            })
        });
    }
}

export const getNote = (id, onResults) => {
    let filters = {
        kinds: [1, 6],
        ids: [id],
        limit: 1
    };
    getPoolService().list(filters, { timeout: 500 }).then(results => {
        let event = results[0];
        let note = getNoteModel(event);
        if (validateEvent(event)) {
            onResults(note);
            addMetadataToLoad(event.pubkey)
            event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                addMetadataToLoad(v);
            })
        }
    });
}

export const listNoteRelateds = (id, limit, onResults) => {
    console.log(`listNoteRelateds for id:${id} `);
    let filters = {
        kinds: [1, 6, 7, 9735],
        "#e": [id],
        limit: 5000
    };
    getPoolService().list(filters).then(results => {
        let replies = [];
        let likes = [];
        let zaps = [];
        let reposts = [];
        results.forEach(event => {
            addMetadataToLoad(event.pubkey)
            event.tags.filter(([t, v]) => t === 'p').forEach(([t, v]) => {
                addMetadataToLoad(v);
            });
            switch (event.kind) {
                case 1:
                    replies.push(getNoteModel(event));
                    break;
                case 6:
                    reposts.push(getNoteModel(event));
                    break;
                case 7:
                    likes.push(event);
                    break;
                case 9735:
                    let zap = event;
                    let bolt11 = zap.tags.filter(t => t[0] === 'bolt11');
                    zap.amount = 0;
                    if (bolt11[0] && bolt11[0][1]) {
                        const zapAmountRgx = /lnbc([0-9]+)([m|n|u|p])/;
                        let amount = zapAmountRgx.exec(bolt11[0][1]);
                        if (amount) {
                            zap.amount = parseInt(amount[1]);
                            if (amount[2] === 'u')
                                zap.amount = zap.amount * 100;
                            if (amount[2] === 'n')
                                zap.amount = zap.amount / 10;
                        }
                    }
                    zaps.push(zap);
                    break;
                default:
            }
        });
        onResults({
            replies: replies,
            likes: likes,
            zaps: zaps,
            reposts: reposts
        });
    })
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

export const search = (type, term, onResults) => {
    console.log(`Search, type: ${type}, term:${term} `)
    let kinds = type === "users" ? [0] : [1, 6];
    if (type === "users") {
        let cachedUsers = store.getState().user.usersMetadata;
        let cachedResults = []
        Object.keys(cachedUsers).forEach(u => {
            if (performUserSearch(term, cachedUsers[u])) {
                cachedResults.push({ publicKeyHex: u, userMetadata: cachedUsers[u] });
            }
        })
        onResults(cachedResults);
    }
    let filters = {
        kinds: kinds,
        limit: type === "notes" ? 500 : 5000,
    };
    if (type === "notes")
        filters["#t"] = [term];
    let sub = getPoolService().createSubscription(filters);
    sub.onEvent(event => {
        if (type === "users") {
            let userMetadata = JSON.parse(event.content);
            if (performUserSearch(term, userMetadata)) {
                if (validateEvent(event)) {
                    addMetadataToLoad(event.pubkey);
                    onResults({ publicKeyHex: event.pubkey, userMetadata: userMetadata });
                }
            }
        } else {
            let note = getNoteModel(event);
            if (performContentSearch(term, note)) {
                if (validateEvent(note)) {
                    addMetadataToLoad(event.pubkey);
                    onResults(note);
                }
            }
        }
    });
}

export const publishNote = draftNote => {
    let event = {
        kind: 1,
        created_at: draftNote.created_at,
        tags: draftNote.tags ?? [],
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
    sign(event, store.getState().user.account).then(signedEvent => {
        let pubs = getPoolService().publish(signedEvent);
        pubs.onPublish(result => {
            console.log(result);
        });
    }).catch(err => {
        console.log(err);
    });

}

export const likeNote = note => {
    let event = {
        kind: 7,
        created_at: Math.floor(new Date() / 1000),
        tags: [],
        content: '+',
        pubkey: nip19.decode(store.getState().user.account.publicKey).data
    };
    event.tags.push(['e', note.id]);
    event.id = getEventHash(event)
    sign(event, store.getState().user.account).then(signedEvent => {
        let pubs = getPoolService().publish(signedEvent);
        pubs.onPublish(result => {
            console.log(result);
        });
    }).catch(err => {
        console.log(err);
    });
    store.dispatch(setAccount(null, null, null, [note.id]));
}

export const repostNote = note => {
    let event = {
        kind: 6,
        created_at: Math.floor(new Date() / 1000),
        tags: [],
        content: JSON.stringify(note),
        pubkey: nip19.decode(store.getState().user.account.publicKey).data
    };
    event.tags.push(['e', note.id]);
    event.id = getEventHash(event)
    sign(event, store.getState().user.account).then(signedEvent => {
        let pubs = getPoolService().publish(signedEvent);
        pubs.onPublish(result => {
            console.log(result);
        });
    }).catch(err => {
        console.log(err);
    });
}
export const publishProfile = profile => {
    let event = {
        kind: 0,
        created_at: Math.floor(new Date() / 1000),
        tags: [],
        content: JSON.stringify(profile),
        pubkey: nip19.decode(store.getState().user.account.publicKey).data
    };
    event.id = getEventHash(event)
    sign(event, store.getState().user.account).then(signedEvent => {
        let pubs = getPoolService().publish(signedEvent);
        pubs.onPublish(result => {
            console.log(result);
        });
    }).catch(err => {
        console.log(err);
    });
}

export const addFollowing = (publicKeyHex) => {
    let event = {
        kind: 3,
        created_at: Math.floor(new Date() / 1000),
        tags: [],
        content: "",
        pubkey: nip19.decode(store.getState().user.account.publicKey).data
    };
    let following = store.getState().user.following;
    following.forEach(f => {
        event.tags.push(['p', f]);
    })
    event.tags.push(['p', publicKeyHex]);
    event.id = getEventHash(event)
    sign(event, store.getState().user.account).then(signedEvent => {
        let pubs = getPoolService().publish(signedEvent);
        pubs.onPublish(result => {
            console.log(result);
        });
    }).catch(err => {
        console.log(err);
    });
    store.dispatch(setAccount(null, null, [publicKeyHex]));
}

export const removeFollowing = (publicKeyHex) => {
    return (dispatch, getState) => {
        dispatch({ type: REMOVE_FOLLOWING, data: publicKeyHex });
    }
}

