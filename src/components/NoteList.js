import { Link } from "@chakra-ui/react";
import { nip19 } from "nostr-tools";
import Note from "./Note";

const NoteList = props => {
    return (
        props.notes.map((note) => {
            if (note)
                return (<Note note={note} isThread={props.isThread} isReply={props.isReply} key={'Note' + note.id} />);
            else return null
        })
    )
}

export default NoteList;