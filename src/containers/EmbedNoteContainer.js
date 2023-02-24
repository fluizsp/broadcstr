import { Box, Container, Spinner, SlideFade, VStack, Fade, Button, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { nip19 } from 'nostr-tools';


import { getNote } from '../actions/relay';

import { getUsersMetadata } from '../actions/relay'
import NoteList from '../components/NoteList';
import { useParams } from 'react-router';

const mapDispatchToProps = (dispatch) => {
    return {
        loadUsersMetadata: () => {
            dispatch(getUsersMetadata());
        },
        loadNote: (id) => {
            dispatch(getNote(id));
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.user.account,
        likes: state.user.likes,
    }
};

const EmbedNoteContainer = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const noteId = nip19.decode(params.id).data;
    useEffect(() => {
        if (!props.note || props.note.id !== noteId) {
            props.loadNote(noteId);
        }
    }, [noteId]);
    let note = useSelector(state => state.content.notes[noteId]) ?? {};
    console.log("Render Note Details");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box>
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    {note && note.id ?
                        <NoteList notes={[note]} likes={props.likes} /> : null}
                    <VStack>
                        <Fade in={!note.id} >
                            <Spinner mt="24" size="xl" color="blue.300" />
                        </Fade>
                    </VStack>
                </SlideFade>
            </Box>
        </Box>

    )
}
export default connect(mapStateToProps, mapDispatchToProps)(EmbedNoteContainer);