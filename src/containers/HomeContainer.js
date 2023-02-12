import { Center, Box, Button, Container, Grid, GridItem, Spinner, Show, SlideFade, VStack } from '@chakra-ui/react'
import { HiPlusCircle } from 'react-icons/hi';
import { Component } from 'react';
import { connect } from 'react-redux';
import { throttle } from 'lodash';

import { getFollowingFeed, getMyInfo, getNotesRelateds } from '../actions/relay';
import Note from '../components/Note';

import LazyLoad from 'react-lazyload';
import { Navigate } from 'react-router';
import withRouter from '../withRouter';
import NoteList from '../components/NoteList';
import { getUsersMetadata } from '../actions/relay'

const mapDispatchToProps = (dispatch) => {
    return {
        loadNotes: (feedType, limit) => {
            dispatch(getFollowingFeed(limit));
        },
        loadMyInfo: (publicKey) => {
            dispatch((getMyInfo(publicKey)));
        },
        loadUsersMetadata: () => {
            dispatch(getUsersMetadata());
        },
        loadNotesRelateds: () => {
            dispatch(getNotesRelateds());
        }
    }
};

const mapStateToProps = throttle((state, ownProps) => {
    return {
        notes: state.relay.notes,
        usersMetadata: state.user.usersMetadata,
        relayLoaded: state.relay.loaded,
        loggedIn: state.user.loggedIn,
        account: state.user.account,
        likes: state.user.likes
    }
}, 1000)

class HomeContainer extends Component {
    renderCount = 0;
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            feedType: '',
            limit: 25
        }
    }
    componentDidUpdate() {

    }
    componentDidMount() {
        if (this.renderCount === 0 && this.props.account.publicKey) {
            this.props.loadMyInfo(this.props.account.publicKey);
            setInterval(() => {
                this.props.loadUsersMetadata();
            }, 5000)
        }
        this.renderCount++;
        /*if (this.state.feedType === '')
            this.props.loadNotes.bind(this, 'following', this)();*/
    }

    loadNotes(feedType) {
        this.setState({ isLoading: true, feedType: feedType });
        this.props.loadNotes(feedType, this.state.limit);
        setTimeout(() => {
            this.setState({ isLoading: false })
        }, 5000);
    }
    moreResults() {
        let newLimit = this.state.limit + 25
        this.setState({ limit: newLimit });
    }
    render() {
        let feedType = this.state.feedType;
        let notes = [];
        Object.keys(this.props.notes).forEach(key => {
            notes.push(this.props.notes[key]);
        });
        notes = notes.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        notes = notes.slice(0, this.state.limit)
        return (
            <Box minH="100vH" bgGradient='linear(to-br, brand.kindsteel1, brand.kindsteel2)'>
                <Box ml={{ md: '100px', lg: '330px' }} >
                    {!this.props.loggedIn ? <Navigate to="/welcome" /> : ''}
                    <SlideFade in={true}>
                        <Container maxW='4xl' pt="80px" pb="20px" >
                            <Grid templateColumns='repeat(12, 1fr)' gap="3" mb="5">
                                <Show above="md">
                                    <GridItem colSpan={7}>
                                        <Box bg="whiteAlpha.700" h="54px" p="1">
                                            <Center>
                                                <Button leftIcon={<HiPlusCircle />} pl="10" pr="10" variant="ghost" size="lg" fontSize="md" color="gray.400">What's on your mind?</Button>
                                            </Center>
                                        </Box>
                                    </GridItem>
                                </Show>
                                <GridItem colSpan={[12, 12, 5]}>
                                    <Box bg="whiteAlpha.700" h="54px" p="4">
                                        <Center>
                                            <Button size="sm" variant="link" pr="5">Trending</Button>
                                            <Button size="sm" variant="link" pr="5" color={feedType === "following" ? "blue.300" : ''} onClick={this.loadNotes.bind(this, 'following', this.state.limit)}>Following</Button>
                                        </Center>
                                    </Box>
                                </GridItem>
                            </Grid>
                            <Center display={this.props.isLoading ? 'flex' : 'none'}>
                                <Spinner size="xl" color="blue.300" />
                            </Center>
                            <LazyLoad height="200px">
                                <NoteList notes={notes} usersMetadata={this.props.usersMetadata} likes={this.props.likes} />
                            </LazyLoad>

                            <VStack mb="50px">
                                <Spinner size="xl" color="blue.300" hidden={!this.state.isLoading} />
                                <Button onClick={this.moreResults.bind(this)} >Next Results...</Button>
                            </VStack>
                        </Container>
                    </SlideFade>
                </Box>
            </Box>

        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomeContainer));