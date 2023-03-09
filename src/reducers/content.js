import { createReducer } from '@reduxjs/toolkit'
import { loadState } from '../localStorage';
import { getNoteModel } from '../model/NoteModel';

const initialState = {
    notes: {},
    allNotes: loadState('content.allNotes') ?? {},
    allNotesRelateds: {},
    feeds: {
        following: {},
        foryou: {},
        trending: {},
        profile: {},
        zaps: {},
    },
    profileFeed: {},
    lastUserId: null,
    usersFollowing: {},
    usersFollowers: {},
    locatedUsers: {},
    locatedNotes: [],
};

export const treatImages = (note) => {
    let imgRgx = new RegExp(/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif|svg))/, 'gmi').exec(note.content);
    if (imgRgx) {
        note.image = imgRgx[1];
        note.content = note.content.replace(imgRgx[0], "");
    }
    return note;
}
export const treatEmbeds = (note) => {
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
        let newNote = getNoteModel(action.data.notes);
        state.allNotes[newNote.id] = newNote;

        if ((!action.data.feedType && state.notes[newNote.id] === undefined)
            || (action.data.feedType && state.feeds[action.data.feedType][newNote.id] === undefined)) {
            if (action.data.feedType)
                state.feeds[action.data.feedType][newNote.id] = newNote;
            else
                state.notes[newNote.id] = newNote;
        }
    },
    RECEIVED_NOTE_RELATED: (state, action) => {
        let noteId = action.data.tags.filter(tag => tag[0] === "e")[0][1];
        if (!state.allNotesRelateds)
            state.allNotesRelateds = {};
        if (!state.allNotesRelateds[noteId])
            state.allNotesRelateds[noteId] = {};
        state.allNotesRelateds[noteId].load = false;
        switch (action.data.kind) {
            case 1:
                let reply = action.data;
                reply = treatImages(reply);
                reply = treatEmbeds(reply);
                reply.pTags = reply.tags.filter(t => t[0] === 'p').map(t => { return t[1] }) ?? [];
                reply.eTags = reply.tags.filter(t => t[0] === 'e').map(t => { return t[1] }) ?? [];
                if (state.allNotesRelateds[noteId].replies) {
                    if (!state.allNotesRelateds[noteId].replies.find(i => i.id === action.data.id))
                        state.allNotesRelateds[noteId].replies.push(reply)
                } else
                    state.allNotesRelateds[noteId].replies = [reply];
                break;
            case 6:
                let repost = action.data;
                if (state.allNotesRelateds[noteId].reposts) {
                    if (!state.allNotesRelateds[noteId].reposts.find(i => i.id === action.data.id))
                        state.allNotesRelateds[noteId].reposts.push(repost)
                } else
                    state.allNotesRelateds[noteId].reposts = [repost];
                break;
            case 7:
                let like = action.data;
                if (state.allNotesRelateds[noteId].likes) {
                    if (!state.allNotesRelateds[noteId].likes.find(i => i.id === action.data.id))
                        state.allNotesRelateds[noteId].likes.push(like)
                } else
                    state.allNotesRelateds[noteId].likes = [like];
                break;
            case 9735:
                let zap = action.data;
                let bolt11 = zap.tags.filter(t => t[0] === 'bolt11');
                zap.amount = 0;
                if (bolt11[0] && bolt11[0][1]) {
                    const zapAmountRgx = /lnbc([0-9]+)([m|n|u|p])/;
                    let amount = zapAmountRgx.exec(bolt11[0][1]);
                    if (amount) {
                        zap.amount = parseInt(amount[1]);
                        if (amount[2] === 'u')
                            zap.amount = zap.amount * 100;
                        if (amount[2] === 'n')
                            zap.amount = zap.amount / 10;
                    }
                }
                if (state.allNotesRelateds[noteId].zaps) {
                    if (!state.allNotesRelateds[noteId].zaps.find(i => i.id === action.data.id))
                        state.allNotesRelateds[noteId].zaps.push(zap)
                } else
                    state.allNotesRelateds[noteId].zaps = [zap];
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
    LOAD_NOTE_RELATED: (state, action) => {
        let noteId = action.data;
        if (!state.allNotesRelateds)
            state.allNotesRelateds = {};
        if (!state.allNotesRelateds[noteId])
            state.allNotesRelateds[noteId] = {};
        state.allNotesRelateds[noteId].load = true;
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
        state.locatedUsers = {};
        state.locatedNotes = [];
    },
    LOCATED_USER: (state, action) => {
        if (!state.locatedUsers[action.data.publicKeyHex])
            state.locatedUsers[action.data.publicKeyHex] = action.data.userMetadata;
    },
    LOCATED_NOTE: (state, action) => {
        let newNote = action.data;
        newNote.pTags = newNote.tags.filter(t => t[0] === 'p').map(t => { return t[1] }) ?? [];
        newNote.eTags = newNote.tags.filter(t => t[0] === 'e').map(t => { return t[1] }) ?? [];
        newNote = treatImages(newNote);
        newNote = treatEmbeds(newNote);
        if (state.locatedNotes.filter(n => n.id === newNote.id).length === 0)
            state.locatedNotes.push(newNote);
    },
    REPLY_TO: (state, action) => {
        state.replyTo = action.data;
    },
    VIEW_IMAGE: (state, action) => {
        state.imageSrc = action.data;
    }
});

export default contentReducer;