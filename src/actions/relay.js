import {
    relayInit,
    nip19,
    validateEvent,
    verifySignature

} from 'nostr-tools'
import { setAccount } from './account';

export const RECEIVED_NOTE = "RECEIVED_NOTE";
export const RECEIVED_USER_METADATA = "RECEIVED_USER_METADATA";
export const RECEIVED_NOTE_RELATED = "RECEIVED_NOTE_RELATED";

const relays = [];

export const receivedNote = (notes) => {
    return {
        type: RECEIVED_NOTE,
        data: { notes: notes }
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

export const loadRelays = () => {
    return ((dispatch, getState) => {
        relays.push(relayInit(getState().relay.addrs[0]));
        relays.push(relayInit(getState().relay.addrs[1]));
        relays.push(relayInit(getState().relay.addrs[2]));
        relays.push(relayInit(getState().relay.addrs[3]));
        relays.push(relayInit(getState().relay.addrs[4]));
        relays.forEach(async relay => {
            relay.on('connect', () => {
                console.log(`connected to ${relay.url}`)
            })
            relay.on('error', () => {
                console.log(`failed to connect to ${relay.url}`)
            })
            await relay.connect();
        })
    });
};

export const getFollowingFeed = (limit) => {
    return ((dispatch, getState) => {
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [1, 6]
                    , authors: getState().user.following,
                    limit: 200
                }
            ])
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
                    })
                }
            })
            sub.on('eose', () => {
                sub.unsub()
            })
        });
    });
}

export const getMyInfo = (publicKey) => {
    return ((dispatch, getState) => {
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [0, 3, 7],
                    authors: [nip19.decode(publicKey).data]
                }
            ])
            sub.on('event', event => {
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
            })
            sub.on('eose', () => {
                sub.unsub()
            })
        });
    });
}

export const getUsersMetadata = () => {
    return ((dispatch, getState) => {
        let count = 0;
        let usersMetadata = getState().user.usersMetadata;
        let emptyUsersMetadata = [];
        Object.keys(usersMetadata).forEach(key => {
            if (!usersMetadata[key].name)
                emptyUsersMetadata.push(key);
        });
        if (emptyUsersMetadata.length > 50)
            emptyUsersMetadata = emptyUsersMetadata.slice(0, 50);
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [0],
                    authors: emptyUsersMetadata
                }
            ])
            sub.on('event', event => {
                let userMetadata = JSON.parse(event.content);
                dispatch(receivedUserMetadata(event.pubkey, userMetadata));
            })
            sub.on('eose', () => {
                sub.unsub()
            })
        });
    });
}

export const getNotesRelateds = () => {
    return ((dispatch, getState) => {
        let notesWihoutRelateds = [];
        Object.keys(getState().relay.notes).forEach(key => {
            if (getState().relay.notes[key].likes.length === 0 && getState().relay.notes[key].replies.length === 0 && getState().relay.notes[key].reposts.length === 0)
                notesWihoutRelateds.push(key);
        });
        if (notesWihoutRelateds.length > 50)
            notesWihoutRelateds = notesWihoutRelateds.slice(0, 50);
        console.log(notesWihoutRelateds)
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [1, 6, 7]
                    , "#e": notesWihoutRelateds
                }
            ])
            sub.on('event', async event => {
                if (validateEvent(event)) {
                    console.log(event);
                    dispatch(receivedNoteRelated(event));
                }
            })
            sub.on('eose', () => {
                sub.unsub()
            })
        });
    });
}