import Note from "./Note";

const NoteList = props => {
    return (
        props.notes.map((note) => {
            if (note)
                return (<Note note={note} isReply={props.isReply} key={'Note' + note.id} />);
            else return null
        })
    )
}

export default NoteList;