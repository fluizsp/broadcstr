import { createSlice } from '@reduxjs/toolkit'
import { NOTES_LOADED, RELAY_LOADED } from '../actions/relay';

const initialState = {
    addr: ' wss://relay.damus.io',
    notes: [],
    loaded: null
};

const relayReducer = (state = initialState, action) => {
    switch (action.type) {
        case RELAY_LOADED:
            return Object.assign({}, state, {loaded:true});
        case NOTES_LOADED:
            state.notes.push(action.data.notes[2])
            return Object.assign({}, state, {});
                
        default:
            return state;
    }
}

export default relayReducer;