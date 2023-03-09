import { SimplePool } from "nostr-tools";
import { addNoteRelatedToload, receivedUserMetadata } from "../actions/relay";
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