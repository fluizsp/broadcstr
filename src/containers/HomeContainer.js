import { Center, Box, Button, Container, Spinner, SlideFade, VStack, Flex, Tab, TabList, Tabs, Tooltip } from '@chakra-ui/react'
import { useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { useColorModeValue } from '@chakra-ui/react';
import { addNoteRelatedToload, getHomeFeed, getMyInfo, selectMetadatas, UNLOAD_NOTES } from '../actions/relay';

import LazyLoad from 'react-lazyload';
import { Navigate } from 'react-router';
import NoteList from '../components/NoteList';
import { getUsersMetadata } from '../actions/relay'
import { useEffect } from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { ReloadCircle } from 'react-ionicons';
import ReloadOutline from 'react-ionicons/lib/ReloadOutline';
import { HiRefresh } from 'react-icons/hi';

const mapDispatchToProps = (dispatch) => {
    return {
        loadNotes: (feedType, limit) => {
            dispatch(getHomeFeed(feedType, limit));
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
        selectMetadata: () => {
            dispatch(selectMetadatas());
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
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
    useEffect(() => {
        setTimeout(() => {
            props.loadNotes('following');
            props.loadMyInfo();
        }, 1000)
        document.title="Broadcstr"
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
    notes = useSelector(state => Object.keys(state.content.homeFeed).map(k => { return state.content.homeFeed[k] })
        .filter(note => (note.kind === 1 && note.tags.filter(t => t[0] === "e").length === 0) || note.kind === 6)
        .sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        .slice(0, limit * 2), (a, b) => {
            if (!a)
                return false;
            let aIds = a.map(aNote => { return aNote.id });
            aIds = aIds.join(",");
            let bIds = b.map(bNote => { return bNote.id });
            bIds = bIds.join(",");
            return aIds === bIds;
        })
    let drafts = useSelector(state => state.content.draftEvents ?? []);
    if (drafts)
        drafts.forEach(d => notes.push(d));
    notes = notes.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
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
                                            <Tab isDisabled><Tooltip label="Coming soon!">Trending</Tooltip></Tab>
                                            <Tab onClick={loadNotes.bind(this, 'following')}>Following</Tab>
                                        </TabList>
                                    </Tabs>
                                </Center>
                            </Box>
                            <Box bg={uiColor} h="50px" p="2" w="60px">
                                <Button size="sm" variant="ghost" onClick={loadNotes.bind(this, feedType)}><HiRefresh /></Button>
                            </Box>
                        </Flex>
                        <LazyLoad height="200px">
                            <NoteList notes={notes.slice(0, limit)} />
                        </LazyLoad>
                        <VStack mb="50px">
                            <Spinner size="xl" color="blue.300" hidden={notes.length !== 0} />
                            <Button hidden={notes.length === 0 || notes.length < limit} onClick={moreResults.bind(this)} >Next Results...</Button>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>
    )
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);