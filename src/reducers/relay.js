import { createReducer } from '@reduxjs/toolkit'

const initialState = {
    addrs: ['wss://relay.nostr.info','wss://relay.damus.io'],
    notes: {},
    loaded: null
};

const treatImages = (note) => {
    let imgRgx = new RegExp(/(https?:\/\/.*\.(?:png|jpg|gif))/, 'gmi').exec(note.content);
    if (imgRgx) {
        note.image = imgRgx[1];
        note.content = note.content.replace(imgRgx[0], "");
    }
    return note;
}

const relayReducer = createReducer(initialState, {
    RELAY_LOADED: (state, action) => {
        state.loaded = true;
    }
    , NOTES_LOADED: (state, action) => {
        if (action.data.notes[0] === "NOTICE")
            console.log(`${action.data.notes[0]} - ${action.data.notes[1]}`);
        if (action.data.notes.length > 2) {
            let newNote = action.data.notes[2];
            newNote = treatImages(newNote);
            state.notes[newNote.id]=newNote;
        }
    }
});

export default relayReducer;