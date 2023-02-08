import { createReducer } from '@reduxjs/toolkit'

const initialState = {
    addrs: ['wss://relay.nostr.info', 'wss://relay.damus.io'],
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
    NOTES_LOADED: (state, action) => {
        let newNote = action.data.notes;

        newNote = treatImages(newNote);
        state.notes[newNote.id] = newNote;
    }
});

export default relayReducer;