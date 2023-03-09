import { SimplePool, validateEvent } from "nostr-tools";
import { addNoteRelatedToload, receivedUserMetadata, RECEIVED_NOTE_RELATED } from "../actions/relay";
import { getNoteModel } from "../model/NoteModel";
import store from "../store";
import { getPoolService } from "./NostrRelayPoolService";

const nostrPool = new SimplePool();

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
        event.tags.forEach(async tag => {
            if (tag[0] === 'p' && !store.getState().user.usersMetadata[tag[1]]) {
                store.dispatch(receivedUserMetadata(tag[1], {}));
            }
        })
        if (eventBulk.length > 10) {
            eventBulk.forEach(event => {
                store.dispatch(addNoteRelatedToload(event.id));
            });
            onNotes(eventBulk.map(e => getNoteModel(e)));
            eventBulk = [];
        }
    });
    sub.onEose(() => {
        eventBulk.forEach(event => {
            store.dispatch(addNoteRelatedToload(event.id));
        });
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
                event.tags.forEach(t => {
                    if (t[0] === "p")
                        if (!store.getState().user.usersMetadata[t[1]]) {
                            store.dispatch(receivedUserMetadata(t[1], {}));
                        }
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

export const getZapsFeed = (limit, onResults) => {
    let events = {};
    let zapsFilters = {
        kinds: [9735],
        limit: limit * 5
    };
    getPoolService().list(zapsFilters, { timeout: 500 }).then(results => {
        console.log(results.length)
        results.forEach(zap => {
            let zapInfo = {};
            let noteId = zap.tags.filter(t => t[0] === 'e')[0];
            if (noteId) {
                noteId = noteId[1];
                store.dispatch({ type: RECEIVED_NOTE_RELATED, data: zap });
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
        let sub = getPoolService().createSubscription(eventsFilters);
        sub.onEvent(event => {
            let notes = [];
            if (events[event.id]) {
                let model = getNoteModel(event);
                model.zapAmount = events[event.id];
                if (model.zapAmount && validateEvent(event) && ((event.kind === 1 && event.tags.filter(tag => { return tag[0] === "e" }).length === 0) || event.kind === 6)) {
                    if (!store.getState().user.usersMetadata[event.pubkey]) {
                        store.dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !store.getState().user.usersMetadata[tag[1]]) {
                            store.dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    });
                    store.dispatch(addNoteRelatedToload(event.id));
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
                    /*notes.forEach(event => {
                        store.dispatch(addNoteRelatedToload(event.id));
                    });*/
                    //onResults(notes);
                    //notes = [];
                }
            }
        });
        sub.onEose(() => {
            /*notes.forEach(event => {
                       store.dispatch(addNoteRelatedToload(event.id));
                   });*/
            onResults(notes);
            notes = [];
        });
    }
}