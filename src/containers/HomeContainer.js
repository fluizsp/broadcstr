import { Center, Box, Button, Container, Spinner, SlideFade, VStack, Flex, Tab, TabList, Tabs } from '@chakra-ui/react'
import { Component, useState } from 'react';
import { connect } from 'react-redux';
import { throttle } from 'lodash';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { addNoteRelatedToload, getFollowingFeed, getMyInfo, getNotesRelateds, selectMetadatas, UNLOAD_NOTES } from '../actions/relay';

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
            setTimeout(() => {
                dispatch((getMyInfo(publicKey)));
            }, 1000);
        },
        loadUsersMetadata: () => {
            dispatch(getUsersMetadata());
        },
        addNoteRelatedToload: id => {
            dispatch(addNoteRelatedToload(id));
        },
        unloadNotes: () => {
            dispatch({ type: UNLOAD_NOTES });
        },
        selectMetadata: () => {
            dispatch(selectMetadatas());
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        notes: state.content.selectedNotes,
        loggedIn: state.user.loggedIn,
        account: state.user.account,
        likes: state.user.likes
    }
}

const HomeContainer = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const [feedType, setFeedType] = useState('following');
    const [limit, setLimit] = useState(25);
    let metadataInterval = null;
    //const publicKey = props.account.publicKey;
    useEffect(() => {
        props.unloadNotes();
        props.loadNotes('following');
        props.loadMyInfo();
    }, [])

    const loadNotes = feedType => {
        console.log('loadNotes');
        setFeedType(feedType);
        props.loadNotes(feedType, limit * 4);
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
                                            <Tab onClick={loadNotes.bind(this, 'following')}>Following</Tab>
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
                            <NoteList notes={notes} />
                        </LazyLoad>
                        <VStack mb="50px">
                            <Spinner size="xl" color="blue.300" hidden={notes.length !== 0} />
                            <Button hidden={notes.length === 0} onClick={moreResults.bind(this)} >Next Results...</Button>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>

    )
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);