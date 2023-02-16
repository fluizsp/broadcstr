import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Grid, GridItem, Avatar, Text, HStack, Tabs, TabList, Tab } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { getMyInfo, getUserNotes, receivedUserMetadata, RECEIVED_USER_ID, selectMetadatas, SELECT_NOTES, SET_LIMIT, UNLOAD_NOTES } from '../actions/relay';
import { getUsersMetadata } from '../actions/relay'
import { useParams } from 'react-router';
import { nip19 } from 'nostr-tools';
import NoteList from '../components/NoteList';
import defaultBanner from '../defaultbanner.jpeg';

const mapDispatchToProps = (dispatch, getState) => {
    return {
        loadUsersMetadata: () => {
            dispatch(getUsersMetadata());
        },
        loadUser: (publicKeyHex) => {
            dispatch(receivedUserMetadata(publicKeyHex, { load: true }));
            dispatch({ type: RECEIVED_USER_ID, data: publicKeyHex })
        },
        loadMyInfo: (publicKeyHex) => {
            dispatch((getMyInfo(publicKeyHex)));
        },
        loadNotes: (publicKeyHex, limit) => {
            console.log(`dispatch(getUserNotes(${publicKeyHex}, ${limit}));`)
            dispatch(getUserNotes(publicKeyHex, limit * 5));
        },
        unloadNotes: () => {
            dispatch({ type: UNLOAD_NOTES });
        },
        setLimit: newLimit => {
            dispatch({ type: SET_LIMIT, data: newLimit });
        },
        selectNotes: (from, excludeReplies, onlyReplies, sortOrder, limit) => {
            dispatch({
                type: SELECT_NOTES,
                data: {
                    from: from,
                    excludeReplies: excludeReplies,
                    onlyReplies: onlyReplies,
                    sortOrder: sortOrder,
                    limit: limit
                }
            })
        },
        selectMetadata: () => {
            dispatch(selectMetadatas());
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        userId: state.relay.lastUserId,
        user: state.user.usersMetadata[state.relay.lastUserId] ?? {},
        selectedNotes: state.relay.selectedNotes,
        account: state.user.account,
        limit: state.relay.limit
    }
};

const ProfileContainer = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState(0);
    const [limit, setLimit] = useState(25);
    let noteSelectInterval = null;
    let metadataLoadInterval = null;
    let metadataSelectInterval = null;
    /*const moreResults = () => {
        this.props.setLimit(props.limit + 25);
    }*/
    useEffect(() => {
        let loading = false;
        let publicKeyHex = nip19.decode(params.id).data;
        if (!props.user || props.userId !== publicKeyHex) {
            props.loadUser(publicKeyHex);
            props.unloadNotes();
            props.loadNotes(publicKeyHex, 25);
            loading = true;
        }

        /*if (!props.note || (!props.note.likes && !props.note.replies && !props.note.reposts)) {
            loading = true
            props.loadNoteRelateds(params.id);
        }*/
        if (!loading)
            setIsLoading(loading);

    }, [params.id, props.userId]);
    useEffect(() => {
        props.unloadNotes();
        props.loadMyInfo(props.account.publicKey);
        console.log('useEffect publicKey')

        setInterval(() => {
            props.loadUsersMetadata();
        }, 5000)
        noteSelectInterval = setInterval(() => {
            console.log('setInterval selectNotes');
            props.selectNotes(nip19.decode(params.id).data, activeView === 0, activeView === 1, "asc", limit)
        }, 2000);
        metadataLoadInterval = setInterval(() => {
            console.log('setInterval loadUsersMetadata');
            props.loadUsersMetadata();
        }, 5000);
        metadataSelectInterval = setInterval(() => {
            console.log('setInterval selectMetadata');
            props.selectMetadata();
        }, 2000);
    }, [])
    useEffect(() => () => {
        clearInterval(noteSelectInterval);
        clearInterval(metadataSelectInterval);
        clearInterval(metadataLoadInterval);
    }, []);
    let notes = [];
    let replies = [];
    /*notes = useSelector(state => Object.keys(state.relay.notes).map(key => {
        return state.relay.notes[key];
    })
        .filter(note => (note.kind === 1 && note.tags.filter(t => t[0] === "e").length === 0) || note.kind === 6)
        .sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        .slice(0, props.limit));
    replies = useSelector(state => Object.keys(state.relay.notes).map(key => {
        return state.relay.notes[key];
    })
        .filter(note => note.kind === 1 && note.tags.filter(t => t[0] === "e").length > 0)
        .sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        .slice(0, props.limit));
    */
    notes = props.selectedNotes;
    /*Object.keys(useSelector(state=>state.relay.notes)).forEach(key => {
        let note = state.relay.notes[key];
        if (note.pubkey === state.relay.lastUserId) {
            if (note.kind === 1 & note.tags.filter(t => t[0] === "e").length > 0)
                replies.push(note);
            else
                notes.push(note);
        }
    });
    notes = notes.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    notes = notes.slice(0, state.relay.limit);
    replies = replies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    replies = replies.slice(0, state.relay.limit);*/
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Box className='box1' width="100%" height="300px" mb="-300px"
                        sx={{
                            bgImage: props.user.banner??defaultBanner,
                            bgSize: 'cover',
                            bgPosition: 'center',
                            maskImage: "linear-gradient(180deg, #fff 25%, #ffffff00 100%);"
                        }}>
                    </Box>
                    <Container maxW='4xl' pt="80px" pb="20px" id="d1">

                        <Card mb="5" bg={uiColor} p="50">
                            <Grid templateColumns="repeat(12,1fr)">
                                <GridItem colSpan={[12, 4]} textAlign="center">
                                    <Avatar size="2xl" src={props.user.picture} name={props.user.display_name ?? props.user.name} />
                                </GridItem>
                                <GridItem colSpan={[12, 8]} textAlign="left" pl="5">
                                    <HStack>
                                        <Text fontSize="xl" as="b" maxW="150px" noOfLines="1">{props.user.display_name ?? props.user.name}</Text>
                                        <Text fontSize="lg" color="gray.400" maxW="150px" noOfLines="1" >@{props.user.name}</Text>
                                    </HStack>
                                    <Text as="b" color="green.400" fontSize="sm">{props.user.nip05}</Text>
                                    <Text>{props.user.about}</Text>
                                </GridItem>
                            </Grid>
                        </Card>
                        {/*.box1{
                            mask-image: "linear-gradient(45deg, #fff 50%, #ffffff00 50%);"
                        }
                        .box2{
                            mask-image: "url('https://pbs.twimg.com/profile_banners/758264276/1668885258/600x200)'"
                        */}
                        <Box bg={uiColor} h="50px" p="2" flex="1" borderRadius={5} mb={5}>

                            <Tabs index={activeView}>
                                <TabList>
                                    <Tab w="25%" onClick={() => { setActiveView(0) }}>Notes</Tab>
                                    <Tab w="25%" onClick={() => { setActiveView(1) }}>Replies</Tab>
                                    <Tab w="25%">Following</Tab>
                                    <Tab w="25%">Followers</Tab>
                                </TabList>
                            </Tabs>
                        </Box>
                        <SlideFade in={activeView === 0}>
                            <NoteList notes={notes} />
                        </SlideFade>
                        <SlideFade in={activeView === 1}>
                            <NoteList notes={replies} />
                        </SlideFade>
                        <VStack>
                            {/*total > noteReplies.length ? <Button onClick={moreResults.bind(this)} >Show older replies...</Button> : null*/}
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer);