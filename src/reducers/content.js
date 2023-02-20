import { createReducer } from '@reduxjs/toolkit'


const initialState = {
    addrs: ['wss://relay.nostr.info', 'wss://relay.damus.io', 'wss://nostr-pub.wellorder.net', 'wss://nostr-pub.semisol.dev'],
    //'wss://nostr.onsats.org'
    notes: {},
    selectedNotes: [],
    relatedsToLoad: [],
    relatedsRequested: [],
    loaded: null,
    limit: 25,
    lastUserId: null,
    selectedMetadata: {},
    usersFollowing: {},
    usersFollowers: {},
    locatedUsers: {},
    locatedNotes: []
};

const treatImages = (note) => {
    let imgRgx = new RegExp(/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif|svg))/, 'gmi').exec(note.content);
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
        let src = ytRgx[0].replace('youtube.com/', 'youtube.com/embed/');
        src = src.replace('youtu.be/', 'youtube.com/embed/');
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

const contentReducer = createReducer(initialState, {
    RECEIVED_NOTE: (state, action) => {
        let newNote = action.data.notes;
        if (action.data.lastId)
            state.lastId = action.data.lastId;
        if (state.notes[newNote.id] === undefined) {
            if (newNote.kind === 6) {
                let reposted_by = newNote.pubkey;
                newNote = JSON.parse(newNote.content);
                newNote.reposted_by = reposted_by;
            }
            newNote.pTags = newNote.tags.filter(t => t[0] === 'p').map(t => { return t[1] }) ?? [];
            newNote.eTags = newNote.tags.filter(t => t[0] === 'e').map(t => { return t[1] }) ?? [];
            newNote = treatImages(newNote);
            newNote = treatEmbeds(newNote);
            state.notes[newNote.id] = newNote;
        }
    },
    LOAD_NOTE_RELATED: (state, action) => {
        let id = action.data;
        if (state.relatedsToLoad.indexOf(id) === -1)
            state.relatedsToLoad.push(id);
    },
    NOTE_RELATED_REQUESTED: (state, action) => {
        console.log('NOTE_RELATED_REQUESTED');
        let id = action.data;
        if (state.relatedsRequested.indexOf(id) === -1)
            state.relatedsRequested.push(id);
    },
    RECEIVED_NOTE_RELATED: (state, action) => {
        let noteId = action.data.event.tags.filter(tag => tag[0] === "e")[0][1];
        if (state.notes[noteId])
            switch (action.data.event.kind) {
                case 1:
                    let reply = action.data.event;
                    reply = treatImages(reply);
                    reply = treatEmbeds(reply);
                    reply.pTags = reply.tags.filter(t => t[0] === 'p').map(t => { return t[1] }) ?? [];
                    reply.eTags = reply.tags.filter(t => t[0] === 'e').map(t => { return t[1] }) ?? [];
                    if (state.notes[noteId].replies) {
                        if (!state.notes[noteId].replies.find(i => i.id === action.data.event.id))
                            state.notes[noteId].replies.push(reply)
                    } else
                        state.notes[noteId].replies = [reply];
                    break;
                case 6:
                    if (state.notes[noteId].reposts) {
                        state.notes[noteId].reposts++
                    }
                    else
                        state.notes[noteId].reposts = 1;
                    break;
                case 7:
                    if (state.notes[noteId].likes) {
                        state.notes[noteId].likes++;
                    }
                    else
                        state.notes[noteId].likes = 1;
                    break;
                default:

            }
    },
    RECEIVED_USER_ID: (state, action) => {
        state.lastUserId = action.data;
    },
    UNLOAD_NOTES: (state, action) => {
        state.notes = {};
        state.selectedNotes = [];
    },
    SET_FEED_TYPE: (state, action) => {
        state.feedType = action.data;
    },
    SET_LIMIT: (state, action) => {
        state.limit = action.data;
    },
    SELECT_NOTES: (state, action) => {
        let selectedNotes = Object.keys(state.notes).map(key => {
            return state.notes[key];
        });
        if (action.data) {
            if (action.data.from)
                selectedNotes = selectedNotes.filter(note => (note.pubkey === action.data.from))
            if (action.data.excludeReplies)
                selectedNotes = selectedNotes.filter(note => (note.kind === 1 && note.tags.filter(t => t[0] === "e").length === 0) || note.kind === 6)
            if (action.data.onlyReplies)
                selectedNotes = selectedNotes.filter(note => note.kind === 1 && note.tags.filter(t => t[0] === "e").length > 0)
            selectedNotes = selectedNotes.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
            if (action.data.limit)
                selectedNotes = selectedNotes.slice(0, action.data.limit ?? 50);
        }
        state.selectedNotes = selectedNotes;
    },
    SELECT_METADATA: (state, action) => {
        state.selectedMetadata = action.data;
    },
    USER_FOLLOWING: (state, action) => {
        let publicKeyHex = action.data.pubkey
        let followingList = action.data.tags.map(t => {
            if (t[0] === "p")
                return t[1]
        })
        if (!state.usersFollowing[publicKeyHex])
            state.usersFollowing[publicKeyHex] = followingList;
        else {
            followingList.forEach(f => {
                if (state.usersFollowing[publicKeyHex].indexOf(f) === -1)
                    state.usersFollowing[publicKeyHex].push(f)
            })
        }
    },
    USER_FOLLOWER: (state, action) => {
        //FOLLOWERS
        let publicKeyHex = action.data.publicKeyHex;
        if (!state.usersFollowers[publicKeyHex])
            state.usersFollowers[publicKeyHex] = [action.data.follower];
        else {
            if (state.usersFollowers[publicKeyHex].indexOf(action.data.follower) === -1)
                state.usersFollowers[publicKeyHex].push(action.data.follower)
        }
    },
    CLEAR_SEARCH: (state, action) => {
        console.log("CLEAR SEARCH")
        state.locatedUsers = {};
        state.locatedNotes = [];
    },
    LOCATED_USER: (state, action) => {
        if (!state.locatedUsers[action.data.publicKeyHex])
            state.locatedUsers[action.data.publicKeyHex] = action.data.userMetadata;
    },
    LOCATED_NOTE: (state, action) => {
        //console.log(action.data);
        let newNote = action.data;
        newNote.pTags = newNote.tags.filter(t => t[0] === 'p').map(t => { return t[1] }) ?? [];
        newNote.eTags = newNote.tags.filter(t => t[0] === 'e').map(t => { return t[1] }) ?? [];
        newNote = treatImages(newNote);
        newNote = treatEmbeds(newNote);
        if (state.locatedNotes.filter(n => n.id ===newNote.id).length === 0)
            state.locatedNotes.push(newNote);
    }
});

export default contentReducer;