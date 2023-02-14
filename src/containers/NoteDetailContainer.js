import { Box, Container, Spinner, SlideFade, VStack, Fade, Button,useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';


import { getMyInfo, getNote, getNoteRelateds } from '../actions/relay';

import { getUsersMetadata } from '../actions/relay'
import NoteList from '../components/NoteList';
import { useParams } from 'react-router';

const mapDispatchToProps = (dispatch) => {
    return {
        loadUsersMetadata: () => {
            dispatch(getUsersMetadata());
        },
        loadNoteRelateds: (id) => {
            dispatch(getNoteRelateds(id));
        },
        loadMyInfo: (publicKey) => {
            dispatch((getMyInfo(publicKey)));
        },
        loadNote: (id) => {
            dispatch(getNote(id));
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        note: state.relay.notes[state.relay.lastId],
        usersMetadata: state.user.usersMetadata,
        account: state.user.account,
        likes: state.user.likes,
    }
};

const NoteDetailContainer = props => {
    const uiColor=useColorModeValue('brand.lightUi','brand.darkUi');
    const bgGradient=useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)','linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [limit, setLimit] = useState(25);
    const moreResults = () => {
        setLimit(limit + 25);
    }
    useEffect(() => {
        let loading = false;
        if (!props.note || props.note.id !== params.id) {
            props.loadNote(params.id);
            loading = true;
        }
        if (!props.note || (!props.note.likes && !props.note.replies && !props.note.reposts)) {
            loading = true
            props.loadNoteRelateds(params.id);
        }
        if (!loading)
            setIsLoading(loading);

    }, [props.loadNote, props.loadNoteRelateds, props.note, params.id,]);
    useEffect(() => {
        props.loadMyInfo(props.account.publicKey);
    }, [props.loadMyInfo, props.account.publicKey])
    let note = props.note ?? {};
    let noteReplies = [];
    if (note.replies)
        noteReplies = [...note.replies];
    let total = noteReplies.length;
    noteReplies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    noteReplies = noteReplies.slice(0, limit);
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        {note && note.id ?
                            <NoteList notes={[note]} usersMetadata={props.usersMetadata} isThread={true} likes={props.likes} /> : null}
                        {noteReplies ?
                            <NoteList notes={noteReplies} usersMetadata={props.usersMetadata} isReply={true} likes={props.likes} /> : null}
                        <VStack>
                            {total > noteReplies.length ? <Button onClick={moreResults.bind(this)} >Show older replies...</Button> : null}
                            <Fade in={isLoading}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>

    )
}
export default connect(mapStateToProps, mapDispatchToProps)(NoteDetailContainer);