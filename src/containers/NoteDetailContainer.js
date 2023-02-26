import { Box, Container, Spinner, SlideFade, VStack, Fade, Button, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { nip19 } from 'nostr-tools';


import { getNote, listNoteReplies } from '../actions/relay';

import { getUsersMetadata } from '../actions/relay'
import NoteList from '../components/NoteList';
import { useParams } from 'react-router';

const NoteDetailContainer = props => {
    const dispatch = useDispatch()
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [limit, setLimit] = useState(25);
    const noteId = nip19.decode(params.id).data;
    const moreResults = () => {
        setLimit(limit + 25);
    }
    useEffect(() => {
        dispatch(getNote(noteId));
        dispatch(listNoteReplies(noteId));
        document.title = `Brodcstr - Note - ${params.id}`;

    }, [noteId]);
    let note = useSelector(state => state.content.notes[noteId]) ?? {};
    let noteReplies = [];
    if (note.replies)
        noteReplies = [...note.replies];
    let total = noteReplies.length;
    //noteReplies.sort((a, b) => { return a.tags.filter(t => t[0] === 'p').length < b.tags.filter(t => t[0] === 'p').length ? -1 : 1 })
    let sortedNoteReplies = [];
    sortedNoteReplies = [...noteReplies.filter(r => r.eTags.length === 1)]
    sortedNoteReplies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    let sortedNoteRepliesIds = sortedNoteReplies.map(r => { return r.id });
    let secondLevelReplies = noteReplies.filter(r => r.eTags.length === 2);
    secondLevelReplies.forEach(r => {
        let index = sortedNoteRepliesIds.indexOf(r.eTags[1])
        if (index > 0) {
            sortedNoteReplies.splice(index + 1, 0, r)
            sortedNoteRepliesIds.splice(index + 1, 0, r.id)
        }
    })
    let thirdLevelReplies = noteReplies.filter(r => r.eTags.length === 3);
    thirdLevelReplies.forEach(r => {
        let index = sortedNoteRepliesIds.indexOf(r.eTags[2])
        if (index > 0) {
            sortedNoteReplies.splice(index + 1, 0, r)
            sortedNoteRepliesIds.splice(index + 1, 0, r.id)
        }
    })
    console.log("Render Note Details");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        {note && note.id ?
                            <NoteList notes={[note]} isThread={true} likes={props.likes} /> : null}
                        {/*<Box ml="10px">
                            <Card p="5" bg={uiColor} mb={5}>
                                <Button size="sm" leftIcon={<GoReply />} variant="ghost">Reply this note</Button>
                            </Card>
                        </Box>*/}
                        {noteReplies ?
                            <NoteList notes={sortedNoteReplies.slice(0, limit)} isReply={true} likes={props.likes} /> : null}
                        <VStack>
                            {sortedNoteReplies.length > limit ? <Button onClick={moreResults} >Show older replies...</Button> : null}
                            <Fade in={note === {} || sortedNoteReplies.length === 0}>
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