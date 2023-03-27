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
        src = src.replace('/live/','/');
        src = src.replace('/embed/','/');
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

export const getNoteModel = noteEvent => {
    let model = Object.assign({}, noteEvent);
    if (model.kind === 6) {
        let reposted_by = model.pubkey;
        if (model.content && model.content !== "#[0]")
            model = getNoteModel(JSON.parse(model.content));
        if (model.content === "#[0]")
            model.isQuote = true;
        model.reposted_by = reposted_by;
    }
    if (model.tags) {
        model.pTags = model.tags.filter(t => t[0] === 'p').map(t => { return t[1] }) ?? [];
        model.eTags = model.tags.filter(t => t[0] === 'e').map(t => { return t[1] }) ?? [];
    }
    model = treatImages(model);
    model = treatEmbeds(model);
    return model;
}