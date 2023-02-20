import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Grid, GridItem, Avatar, Text, HStack, Tabs, TabList, Tab, Skeleton, Button, Input, InputGroup, InputLeftAddon, InputLeftElement, FormLabel } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { addFollowing, CLEAR_SEARCH, getMyInfo, getUserFollowers, getUserFollowing, getUserNotes, receivedUserMetadata, RECEIVED_USER_ID, removeFollowing, search, SET_LIMIT, UNLOAD_NOTES } from '../actions/relay';
import { useLocation, useParams } from 'react-router';
import { nip19 } from 'nostr-tools';
import NoteList from '../components/NoteList';
import defaultBanner from '../defaultbanner.jpeg';
import { IoIosSearch, IoMdPersonAdd, IoMdRemove } from 'react-icons/io';
import ContactListItem from '../components/ContactListItem';
import { useNavigation } from 'react-router-dom'

const mapDispatchToProps = (dispatch, getState) => {
    return {
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
        addFollowing: publicKeyHex => {
            dispatch(addFollowing(publicKeyHex));
        },
        removeFollowing: publicKeyHex => {
            dispatch(removeFollowing(publicKeyHex));
        },
        loadUserFollowing: publicKeyHex => {
            dispatch(getUserFollowing(publicKeyHex));
        },
        loadUserFollowers: publicKeyHex => {
            dispatch(getUserFollowers(publicKeyHex));
        },
        search: (type, term) => {
            dispatch(search(type, term));
        },
        clearSearch: () => {
            dispatch({ type: CLEAR_SEARCH });
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.user.account,
    }
};

const SearchContainer = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState(0);
    const [limit, setLimit] = useState(50);
    const [searchTerm, setSearchTerm] = useState();
    const moreResults = () => {
        setLimit(limit + 50);
    }

    useEffect(() => {
        props.clearSearch();
        props.loadMyInfo(props.account.publicKey);
        console.log('useEffect publicKey')
    }, [])
    useEffect(() => async () => {
        console.log('useEffect params.term')
        performSearch();

    }, [params.term]);
    let notes = [];
    let users = [];
    notes = useSelector(state => state.content.locatedNotes
        //.sort((a, b) => { return a && b && a.created_at > b.created_at ? -1 : 1 })
        .slice(0, limit), (a, b) => {
            if (!a)
                return false;
            let aIds = a.map(aNote => { return aNote.id });
            aIds = aIds.join(",");
            let bIds = b.map(bNote => { return bNote.id });
            bIds = bIds.join(",");
            return aIds === bIds;
        })
    users = useSelector(state => state.content.locatedUsers);
    users = Object.keys(users).map(u => {
        return {
            publicKeyHex: u,
            metadata: users[u]
        }
    }).slice(0, limit);
    const performSearch = (term) => {
        if (!term)
            term = params.term;
        console.log(term);
        if (term && term.length >= 3) {
            props.search(activeView === 0 ? 'users' : 'notes', term)
            setIsLoading(true);
        }
        setSearchTerm(term);
    }
    console.log("Render Profile");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" id="d1">
                        <Card mb="5" bg={uiColor} p="25px" pb={0}>
                            {/*<FormLabel color="gray.400" mb="5">Searching for: "{params.term}"</FormLabel>*/}
                            <InputGroup variant="unstyçed" mb="5">
                                <InputLeftElement children={<IoIosSearch />}></InputLeftElement>
                                <Input bg="transparent" variant="unstyçed" placeholder={searchTerm === undefined ? 'Search for users and notes...' : `Searching for: "${searchTerm}"`} onKeyUp={async k => { if (k.key === "Enter") { performSearch(k.target.value) } }}></Input>
                            </InputGroup>
                            <Tabs ml="-12px" index={activeView} mr="-12px">
                                <TabList>
                                    <Tab w="50%" onClick={() => { setLimit(25); setActiveView(0); performSearch(); }}>Users</Tab>
                                    <Tab w="50%" onClick={() => { setLimit(25); setActiveView(1); performSearch(); }}>Notes & Replies</Tab>
                                </TabList>
                            </Tabs>
                        </Card>
                        <SlideFade in={activeView === 0} unmountOnExit>
                            {users.map(u => {
                                return (<ContactListItem publicKeyHex={u.publicKeyHex} metadata={u.metadata} addFollowing={props.addFollowing} removeFollowing={props.removeFollowing} />)
                            })}
                        </SlideFade>
                        <SlideFade in={activeView === 1} unmountOnExit>
                            <NoteList notes={notes} />
                        </SlideFade>
                        <VStack>
                            {notes.length > 0 || users.length > 0 ? <Button onClick={moreResults} >Show more...</Button> : null}
                            <Fade in={notes.length === 0 && users.length === 0 && params.term && params.term.length >= 3}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box >

    )
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);