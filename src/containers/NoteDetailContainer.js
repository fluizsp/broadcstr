import { Center, Box, Container, Spinner, SlideFade, VStack, Collapse, Fade } from '@chakra-ui/react'
import { Component } from 'react';
import { connect } from 'react-redux';
import { throttle } from 'lodash';

import { getMyInfo, getNote, getNoteRelateds } from '../actions/relay';

import withRouter from '../withRouter';
import { getUsersMetadata } from '../actions/relay'
import NoteList from '../components/NoteList';

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

const mapStateToProps = throttle((state, ownProps) => {
    const noteId = window.location.pathname.replace('/note/', '');
    //console.log(noteId);
    let last = new Date();
    return {
        note: state.relay.notes[noteId],
        usersMetadata: state.user.usersMetadata,
        account: state.user.account,
        likes: state.user.likes,
        last: last
    }
}, 1000);

class NoteDetailContainer extends Component {
    renderCount = 0;
    constructor(props) {
        super(props);
        //console.log(props);
        this.state = {
            isLoading: true,
            limit: 25
        }
    }
    componentDidUpdate() {
        console.log('componentDidUpdate')
        

    }
    componentDidMount() {
        console.log(this.props.router.params.id);
        if (!this.props.note)
            this.props.loadNote(this.props.router.params.id);
        else {
            if (this.renderCount === 0 && this.props.account.publicKey) {
                this.props.loadMyInfo(this.props.account.publicKey);
                this.props.loadNoteRelateds(this.props.note.id);
                setTimeout(() => {
                    this.setState({ isLoading: false })
                }, 5000)
                setInterval(() => {
                    this.props.loadUsersMetadata();
                }, 5000)
                this.renderCount++;
            }
        }
    }
    moreResults() {
        let newLimit = this.state.limit + 25
        this.setState({ limit: newLimit });
    }
    render() {
        let note = this.props.note ?? {};
        let noteReplies = [];
        if (note.replies)
            noteReplies = [...note.replies];
        noteReplies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        return (
            <Box minH="100vH" bgGradient='linear(to-br, brand.kindsteel1, brand.kindsteel2)'>
                <Box ml={{ md: '100px', lg: '330px' }} >
                    <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                        <Container maxW='4xl' pt="80px" pb="20px" >
                            {note && note.id ?
                                <NoteList notes={[note]} usersMetadata={this.props.usersMetadata} isThread={true} likes={this.props.likes} /> : null}
                            {noteReplies ?
                                <NoteList notes={noteReplies} usersMetadata={this.props.usersMetadata} isReply={true} likes={this.props.likes} /> : null}
                            <VStack>
                                <Fade in={this.state.isLoading}>
                                    <Spinner size="xl" color="blue.300" />
                                </Fade>
                            </VStack>
                            {/*<Button onClick={this.moreResults.bind(this)} >Next Results...</Button>*/}
                        </Container>
                    </SlideFade>
                </Box>
            </Box>

        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NoteDetailContainer));