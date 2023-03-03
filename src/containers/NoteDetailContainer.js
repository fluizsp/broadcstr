import { Box, Container, Spinner, SlideFade, VStack, Fade, Button, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nip19 } from 'nostr-tools';


import { getNote, listNoteRelateds } from '../actions/relay';

import NoteList from '../components/NoteList';
import { useParams } from 'react-router';
import Note from '../components/Note';
import { useIntl } from 'react-intl';

const NoteDetailContainer = props => {
    const dispatch = useDispatch()
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const intl=useIntl();
    const [limit, setLimit] = useState(25);
    const noteId = nip19.decode(params.id).data;
    const moreResults = () => {
        setLimit(limit + 25);
    }
    useEffect(() => {
        dispatch(getNote(noteId));
        dispatch(listNoteRelateds(noteId));
        window.scrollTo(0, 0);
        document.title = `Brodcstr - Note - ${params.id}`;
    }, [noteId]);
    let note = useSelector(state => state.content.allNotes[noteId]) ?? {};
    let noteRelateds = useSelector(state => state.content.allNotesRelateds ? state.content.allNotesRelateds[noteId] : {});
    noteRelateds = noteRelateds ?? {}
    let noteReplies = noteRelateds.replies ?? [];
    let sortedNoteReplies = [];
    sortedNoteReplies = [...noteReplies.filter(r => r.eTags.length === 1)]
    sortedNoteReplies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    let sortedNoteRepliesIds = sortedNoteReplies.map(r => { return r.id });
    for (let iLevel = 2; iLevel < 10; iLevel++) {
        let moreReplies = noteReplies.filter(r => r.eTags.length === iLevel);
        moreReplies.forEach(r => {
            let index = sortedNoteRepliesIds.indexOf(r.eTags[1])
            if (index > 0) {
                sortedNoteReplies.splice(index + 1, 0, r)
                sortedNoteRepliesIds.splice(index + 1, 0, r.id)
            }
        })
    }
    //console.log("Render Note Details");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        {note && note.id ?
                            <Note note={note} relateds={noteRelateds} isThread={true} key={'Note' + note.id} />
                            : null}
                        {noteReplies ?
                            <NoteList notes={sortedNoteReplies.slice(0, limit)} isReply={true} likes={props.likes} /> : null}
                        <VStack>
                            {sortedNoteReplies.length > limit ? <Button onClick={moreResults} >{intl.formatMessage({ id: 'oldersReplies' })}</Button> : null}
                            <Fade in={note === {} || !noteRelateds.replies}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>

    )
}
export default NoteDetailContainer;