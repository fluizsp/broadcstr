import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Tabs, TabList, Tab, Button, Input, InputGroup, InputLeftElement, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { addFollowing, CLEAR_SEARCH, getMyInfo, getUserFollowers, getUserFollowing, getUserNotes, locatedNip05, LOCATED_USER, removeFollowing, search, UNLOAD_NOTES } from '../actions/relay';
import { useParams } from 'react-router';
import NoteList from '../components/NoteList';
import { IoIosSearch } from 'react-icons/io';
import ContactListItem from '../components/ContactListItem';
import { nip05 } from 'nostr-tools';
import { useIntl } from 'react-intl';

const mapDispatchToProps = (dispatch, getState) => {
    return {

    }
};

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.user.account,
    }
};

const SearchContainer = props => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [activeView, setActiveView] = useState(0);
    const [limit, setLimit] = useState(50);
    const [searchTerm, setSearchTerm] = useState(params.term);
    const [noResults, setNoResults] = useState(false);
    const moreResults = () => {
        setLimit(limit + 50);
    }
    const addFollowing = publicKeyHex => {
        dispatch(addFollowing(publicKeyHex));
    }
    const removeFollowing = publicKeyHex => {
        dispatch(removeFollowing(publicKeyHex));
    }
    const loadUserFollowing = publicKeyHex => {
        dispatch(getUserFollowing(publicKeyHex));
    }
    const loadUserFollowers = publicKeyHex => {
        dispatch(getUserFollowers(publicKeyHex));
    }
        
    const clearSearch = async () => {
        await dispatch({ type: CLEAR_SEARCH });
    }

    useEffect(() => {
        clearSearch();
        performSearch();
        document.title = "Broadcstr - Search"
    }, [])
    let notes = [];
    let users = [];
    notes = useSelector(state => state.content.locatedNotes
        //.sort((a, b) => { return a && b && a.created_at > b.created_at ? -1 : 1 })
        .slice(0, limit * 2), (a, b) => {
            if (!a)
                return false;
            let aIds = a.map(aNote => { return aNote.id });
            aIds = aIds.join(",");
            let bIds = b.map(bNote => { return bNote.id });
            bIds = bIds.join(",");
            return aIds === bIds;
        }) ?? [];
    users = useSelector(state => state.content.locatedUsers);
    users = Object.keys(users).map(u => {
        return {
            publicKeyHex: u,
            metadata: users[u]
        }
    });
    const performSearch = term => {
        clearSearch();
        if (!term)
            term = searchTerm;
        if (term && term.length >= 3) {
            if (term.includes('@')) {
                nip05.queryProfile(term).then(value => {
                    if (value) {
                        console.log(value);
                        dispatch(locatedNip05(value.pubkey));
                    }
                })
            }
            setSearchTerm(term);
            dispatch(search(activeView === 0 ? 'users' : 'notes', term.replace('#', '')));
            setNoResults(false);
        }
    }
    const setTab = index => {
        setLimit(25);
        setActiveView(index);
        setSearchTerm();
        setNoResults(false);
    }
    const isLoading = searchTerm && searchTerm.length >= 3 && ((activeView === 0 && users.length === 0) || (activeView === 1 && notes.length === 0))
    console.log("Render Search");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" id="d1">
                        <Card mb="5" bg={uiColor} p="25px" pb={0}>
                            {/*<FormLabel color="gray.400" mb="5">Searching for: "{params.term}"</FormLabel>*/}
                            <InputGroup variant="unstyçed" mb="5">
                                <InputLeftElement children={<IoIosSearch />}></InputLeftElement>
                                <Input bg="transparent" variant="unstyçed" placeholder={searchTerm === undefined ? activeView === 0 ? intl.formatMessage({ id: 'userSearchHelp' }) : intl.formatMessage({ id: 'noteSearchHelp' }) : intl.formatMessage({ id: 'searchingFor' }, { term: searchTerm })} onKeyUp={async k => { if (k.key === "Enter") { performSearch(k.target.value) } }}></Input>
                            </InputGroup>
                            <Tabs ml="-12px" index={activeView} mr="-12px">
                                <TabList>
                                    <Tab w="50%" onClick={() => { setTab(0) }}>{intl.formatMessage({ id: 'users' })}</Tab>
                                    <Tab w="50%" onClick={() => { setTab(1) }}>{intl.formatMessage({ id: 'notesAndReplies' })}</Tab>
                                </TabList>
                            </Tabs>
                        </Card>
                        <SlideFade in={activeView === 0} unmountOnExit>
                            {users.slice(0, limit).map(u => {
                                return (<ContactListItem publicKeyHex={u.publicKeyHex} metadata={u.metadata} addFollowing={addFollowing} removeFollowing={removeFollowing} />)
                            })}
                        </SlideFade>
                        <SlideFade in={activeView === 1} unmountOnExit>
                            <NoteList notes={notes.slice(0, limit)} />
                        </SlideFade>
                        <VStack>
                            {notes.length > limit || users.length > limit ? <Button onClick={moreResults} >{intl.formatMessage({ id: 'moreResults' })}</Button> : null}
                            <Fade in={isLoading}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box >

    )
}

export default SearchContainer;