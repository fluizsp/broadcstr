import { createReducer } from '@reduxjs/toolkit'

const initialState = {
    addrs: ['wss://relay.nostr.info', 'wss://relay.damus.io', 'wss://nostr-pub.wellorder.net', 'wss://nostr.onsats.org', ' wss://nostr-pub.semisol.dev'],
    notes: {},
    loaded: null
};

const treatImages = (note) => {
    let imgRgx = new RegExp(/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))/, 'gmi').exec(note.content);
    if (imgRgx) {
        note.image = imgRgx[1];
        note.content = note.content.replace(imgRgx[0], "");
    }
    return note;
}
const treatEmbeds = (note) => {
    let ytRgx = new RegExp(/(https?:\/\/.*youtube.*.)/, 'gmi').exec(note.content);
    if (!ytRgx)
        ytRgx = new RegExp(/(https?:\/\/youtu.*be.*.)/, 'gmi').exec(note.content);
    if (ytRgx) {
        let src=ytRgx[0].replace('youtube.com/','youtube.com/embed/');
        src=src.replace('youtu.be/','youtube.com/embed/');
        note.embed = { kind: 'youtube', src: src }
        note.content = note.content.replace(ytRgx[0], "");
    }
    let mp4Rgx = new RegExp(/(http[s*]:\/\/.*.mp4)/, 'gmi').exec(note.content);
    if (mp4Rgx) {
        note.embed = { kind: 'mp4', src: mp4Rgx[0] }
        note.content = note.content.replace(mp4Rgx[0], "");
    }
    return note;
}

const relayReducer = createReducer(initialState, {
    RECEIVED_NOTE: (state, action) => {
        let newNote = action.data.notes;
        if (newNote.kind === 6) {
            let reposted_by = newNote.pubkey;
            newNote = JSON.parse(newNote.content);
            newNote.reposted_by = reposted_by;
        }
        newNote = treatImages(newNote);
        newNote = treatEmbeds(newNote);
        state.notes[newNote.id] = newNote;
    },
    RECEIVED_NOTE_RELATED: (state, action) => {
        let noteId = action.data.event.tags.filter(tag => tag[0] === "e")[0][1];
        switch (action.data.event.kind) {
            case 1:
                if (state.notes[noteId].replies)
                    state.notes[noteId].replies.push(action.data.event)
                else
                    state.notes[noteId].replies = [action.data.event];
                break;
            case 6:
                if (state.notes[noteId].reposts)
                    state.notes[noteId].reposts.push(action.data.event)
                else
                    state.notes[noteId].reposts = [action.data.event];
                break;
            case 7:
                if (state.notes[noteId].likes)
                    state.notes[noteId].likes.push(action.data.event)
                else
                    state.notes[noteId].likes = [action.data.event];
                break;
            default:

        }

    }
});

export default relayReducer;