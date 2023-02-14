import { Link } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";
import { Component } from "react";
import LazyLoad from "react-lazyload";
import Note from "./Note";

class NoteList extends Component {
    render() {
        return (
            this.props.notes.map((note) => {
                let authorMetadata = this.props.usersMetadata[note.pubkey] ?? {};
                let content = note.content ?? '';
                const mentionBreak = /(#\[[0-9]+\])/
                content = content.split(mentionBreak);
                let pTags = note.tags ? note.tags.filter(t => t[0] === "p") : [];
                for (let iPTag = 0; iPTag < pTags.length; iPTag++) {
                    let mentionedName = this.props.usersMetadata[pTags[iPTag][1]] ? this.props.usersMetadata[pTags[iPTag][1]].name : pTags[iPTag][1]
                    for (let iC = 0; iC < content.length; iC++) {
                        if (content[iC] === `#[${iPTag}]`)
                            content[iC] = <Link color="blue.300" fontSize="sm" href={'/profile/' + nip19.npubEncode(pTags[iPTag][1])}>@{mentionedName}</Link>;
                    }
                }
                let reposted_by = null;
                if (note.reposted_by) {
                    let repostedByMetadata = this.props.usersMetadata[note.reposted_by];
                    reposted_by = <Link color="blue.300" fontSize="sm" href={'/profile/' + nip19.npubEncode(note.reposted_by)}>@{repostedByMetadata.name ?? nip19.npubEncode(note.reposted_by)}</Link>
                }
                let liked = this.props.likes.filter(l => l === note.id).length > 0;
                if (note)
                    return (<Note note={note} content={content} authorMetadata={authorMetadata} liked={liked} reposted_by={reposted_by} isThread={this.props.isThread} isReply={this.props.isReply} key={'Note' + note.id} />);
                else return null
            }
            ))
    }
}

export default NoteList;