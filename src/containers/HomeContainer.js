import { Center, Box, Button, Container, Spinner, SlideFade, VStack, Flex, Tab, TabList, Tabs } from '@chakra-ui/react'
import { Component, useState } from 'react';
import { connect } from 'react-redux';
import { throttle } from 'lodash';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { addNoteRelatedToload, getFollowingFeed, getMyInfo, getNotesRelateds } from '../actions/relay';

import LazyLoad from 'react-lazyload';
import { Navigate } from 'react-router';
import NoteList from '../components/NoteList';
import { getUsersMetadata } from '../actions/relay'
import { useEffect } from 'react';

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
        loadNoteRelateds: () => {
            dispatch(getNotesRelateds());
        },
        addNoteRelatedToload: id => {
            dispatch(addNoteRelatedToload(id));
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

const HomeContainer = props => {
    const uiColor=useColorModeValue('brand.lightUi','brand.darkUi');
    const bgGradient=useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)','linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const [isLoading, setIsLoading] = useState(false);
    const [feedType, setFeedType] = useState('');
    const [limit, setLimit] = useState(25);
    useEffect(() => {
        props.loadMyInfo(props.account.publicKey);
        setInterval(() => {
            props.loadUsersMetadata();
        }, 5000)
    }, [props.account.publicKey, props.loadMyInfo])
    useEffect(() => {
        props.loadNotes(feedType);
    }, [feedType, props.loadNotes])

    const loadNotes = feedType => {
        this.setState({ isLoading: true, feedType: feedType });
        props.loadNotes(feedType, this.state.limit);
        setTimeout(() => {
            this.setState({ isLoading: false })
        }, 5000);
    }
    const moreResults = () => {
        setLimit(limit + 25);
    }
    let notes = [];
    Object.keys(props.notes).forEach(key => {
        notes.push(props.notes[key]);
    });
    notes = notes.filter(note => (note.kind === 1 && note.tags.filter(tag => { return tag[0] === "e" }).length === 0) || note.kind === 6);
    notes = notes.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    notes = notes.slice(0, limit)
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                {!props.loggedIn ? <Navigate to="/welcome" /> : ''}
                <SlideFade in={true} offsetX="-1000" offsetY="0" unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        <Flex mb="5">
                            <Box bg={uiColor} h="50px" p="2" flex="1">
                                <Center>
                                    <Tabs index={feedType === "following" ? 1 : -1}>
                                        <TabList>
                                            <Tab isDisabled>Trending</Tab>
                                            <Tab onClick={loadNotes.bind(this, 'following', limit)}>Following</Tab>
                                        </TabList>
                                    </Tabs>
                                    {/*<Button size="sm" variant="link" pr="5" color={feedType === "following" ? "blue.300" : ''} onClick={this.loadNotes.bind(this, 'following', this.state.limit)}>Following</Button>*/}
                                </Center>
                            </Box>
                        </Flex>
                        <Center display={props.isLoading ? 'flex' : 'none'}>
                            <Spinner size="xl" color="blue.300" />
                        </Center>
                        <LazyLoad height="200px">
                            <NoteList notes={notes} usersMetadata={props.usersMetadata} likes={props.likes} />
                        </LazyLoad>
                        <VStack mb="50px">
                            <Spinner size="xl" color="blue.300" hidden={!isLoading} />
                            <Button onClick={moreResults.bind(this)} >Next Results...</Button>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>

    )
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);