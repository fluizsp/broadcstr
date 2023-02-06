import RelayService from '../services/relayService';

export const NOTES_LOADED = "NOTES_LOADED";
export const RELAY_LOADED = "RELAY_LOADED";

const relayService = new RelayService();

export const notesLoaded = (notes) => {
    return {
        type: NOTES_LOADED,
        data: { notes: notes }
    }
}
export const relayLoaded = (relay) => {
    return {
        type: RELAY_LOADED,
        data: { relay: relay }
    }
}

export const loadRelay = () => {
    return ((dispatch, getState) => {
        relayService.init(getState().relay.addr, function (message) {
            dispatch(notesLoaded(JSON.parse(message.data)));
        }, function () {
            dispatch(relayLoaded());
        });

    });
};

export const loadNotes = () => {
    return ((dispatch, getState) => {
        console.log('Load Notes');
        relayService.req(getState().relay.addr);
    });
};