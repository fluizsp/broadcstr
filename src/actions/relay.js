import {
    relayInit,
} from 'nostr-tools'

export const NOTES_LOADED = "NOTES_LOADED";

const relays = [];

export const notesLoaded = (notes) => {
    return {
        type: NOTES_LOADED,
        data: { notes: notes }
    }
}

export const loadRelays = () => {
    return ((dispatch, getState) => {
        relays.push(relayInit(getState().relay.addrs[0]));
        relays.push(relayInit(getState().relay.addrs[1]));
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

export const loadNotes = () => {
    return ((dispatch, getState) => {
        relays.forEach(relay => {
            let sub = relay.sub([
                {
                    kinds: [1],
                    authors: ['46fcbe3065eaf1ae7811465924e48923363ff3f526bd6f73d7c184b16bd8ce4d'],
                    limit: 50
                }
            ])

            sub.on('event', event => {
                dispatch(notesLoaded(event));
            })
        });

    });
}