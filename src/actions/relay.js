import RelayService from '../services/relayService';

export const NOTES_LOADED = "NOTES_LOADED";
export const RELAY_LOADED = "RELAY_LOADED";

const relayServices = [];

export const notesLoaded = (notes) => {
    return {
        type: NOTES_LOADED,
        data: { notes: notes }
    }
}
export const relayLoaded = (event) => {
    return {
        type: RELAY_LOADED,
        data: { relay: event }
    }
}

export const loadRelay = () => {
    return ((dispatch, getState) => {
        relayServices.push(new RelayService(getState().relay.addrs[0]));
        relayServices.push(new RelayService(getState().relay.addrs[1]));
        relayServices[0].init(function (message) {
            dispatch(notesLoaded(JSON.parse(message.data)));
        }, function (event) {
            dispatch(relayLoaded(event));
        });

        relayServices[1].init(function (message2) {
            dispatch(notesLoaded(JSON.parse(message2.data)));
        }, function (event) {
            dispatch(relayLoaded(event));
        });

    });
};

export const loadNotes = () => {
    return ((dispatch, getState) => {
        relayServices.forEach(relayService => {
            if(relayService)
            relayService.getNotes(getState().relay.addr);
        });
    });
};