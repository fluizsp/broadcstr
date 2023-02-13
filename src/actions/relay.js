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
export const LOAD_NOTE_RELATED = "LOAD_NOTE_RELATED";
export const NOTE_RELATED_REQUESTED = "NOTE_RELATED_REQUESTED";

let relays = [];
const requestedMetadatas = [];
const notesWithoutRelateds = [];
const requestedRelateds = [];

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

const checkRelay = relay => {
    if (!relay.url)
        return;
    //console.log(`Checking relay ${relay.url}`)
    //console.log(`Current state is ${relay.status}`);
    if (relay.status === 2 || relay.status === 3) {
        //console.log(`Restarting relay ${relay.url}`)
        for (let iR = 0; iR < relays.length; iR++) {
            if (relays[iR].url === relay.url)
                relays[iR] = relayInit(relay.url);
        }
    }
}

export const getFollowingFeed = (limit) => {
    return ((dispatch, getState) => {
        relays.forEach(relay => {
            checkRelay(relay);
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

export const getNote = (id) => {
    return ((dispatch, getState) => {
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [1, 6],
                    ids: [id],
                    limit: 1
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
        let usersMetadata = getState().user.usersMetadata;
        let emptyUsersMetadata = [];
        Object.keys(usersMetadata).forEach(key => {
            if (!usersMetadata[key].name && requestedMetadatas.indexOf(key) === -1)
                emptyUsersMetadata.push(key);
        });
        if (emptyUsersMetadata.length > 50)
            emptyUsersMetadata = emptyUsersMetadata.slice(0, 50);
        emptyUsersMetadata.forEach(key => {
            requestedMetadatas.push(key)
        });
        if (emptyUsersMetadata.length > 0)
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

export const addNoteRelatedToload = (id) => {
    return ((dispatch, getState) => {
        dispatch({
            type: LOAD_NOTE_RELATED,
            data: id
        });
    })
}

export const getNotesRelateds = () => {
    return ((dispatch, getState) => {

        let count = 0;
        let listToRequest = []
        //console.log(getState().relay.relatedsToLoad);
        //console.log(getState().relay.relatedsRequested);
        getState().relay.relatedsToLoad.forEach(async id => {
            if (getState().relay.relatedsRequested.indexOf(id) === -1 && count < 50) {
                count++;
                listToRequest.push(id);
                dispatch({
                    type: NOTE_RELATED_REQUESTED,
                    data: id
                });
            }
        })
        console.log(listToRequest);
        if (listToRequest.length > 0)
            relays.forEach(relay => {
                let sub = relay.sub([
                    {
                        kinds: [1, 6, 7]
                        , "#e": listToRequest
                    }
                ])
                sub.on('event', async event => {
                    if (validateEvent(event)) {
                        //console.log(event);
                        dispatch(receivedNoteRelated(event));
                    }
                })
                sub.on('eose', () => {
                    sub.unsub()
                })
            });
    });
}
export const getNoteRelateds = (id) => {
    return ((dispatch, getState) => {
        console.log(`getNoteRelateds for id:${id}`);
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [1, 6, 7]
                    , "#e": [id]
                }
            ])
            sub.on('event', async event => {
                if (validateEvent(event)) {
                    if (!getState().user.usersMetadata[event.pubkey]) {
                        await dispatch(receivedUserMetadata(event.pubkey, {}));
                    }
                    event.tags.forEach(async tag => {
                        if (tag[0] === 'p' && !getState().user.usersMetadata[tag[1]]) {
                            await dispatch(receivedUserMetadata(tag[1], {}));
                        }
                    })
                    dispatch(receivedNoteRelated(event));
                }
            })
            sub.on('eose', () => {
                sub.unsub()
            })
        });
    });
}