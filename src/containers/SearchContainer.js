import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Tabs, TabList, Tab, Button, Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { locatedNip05 } from '../actions/relay';
import { useParams } from 'react-router';
import NoteList from '../components/NoteList';
import { IoIosSearch } from 'react-icons/io';
import ContactListItem from '../components/ContactListItem';
import { nip05 } from 'nostr-tools';
import { useIntl } from 'react-intl';
import { search } from '../services/ContentServices';

const SearchContainer = props => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [activeView, setActiveView] = useState(0);
    const [limit, setLimit] = useState(50);
    const [users, setUsers] = useState([]);
    const [notes, setNotes] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState(params.term);
    const moreResults = () => {
        setLimit(limit + 50);
    }
    const addFollowing = publicKeyHex => {
        dispatch(addFollowing(publicKeyHex));
    }
    const removeFollowing = publicKeyHex => {
        dispatch(removeFollowing(publicKeyHex));
    }
    useEffect(() => {
        performSearch();
        document.title = "Broadcstr - Search"
    }, [])
    const performSearch = async term => {
        if (!term)
            term = searchTerm;
        if (term && term.length >= 3) {
            let newSearch = true;
            if (term.includes('@')) {
                nip05.queryProfile(term).then(value => {
                    if (value) {
                        setUsers([{ publicKeyHex: value.pubkey, metadata: {} }]);
                    }
                })
            }
            setSearchTerm(term);
            search(activeView === 0 ? 'users' : 'notes', term.replace('#', ''), results => {
                if (activeView === 0) {
                    let updatedUsers = newSearch ? [] : users;
                    newSearch = false;
                    results.forEach(r => {
                        if (r.publicKeyHex && updatedUsers.filter(u => u.publicKeyHex === r.publicKeyHex).length === 0)
                            updatedUsers.push(r);
                    })
                    setUsers(updatedUsers);
                    setLastUpdate(new Date());
                }
                if (activeView === 1) {
                    let updatedNotes = newSearch ? [] : notes;
                    newSearch = false;
                    if (updatedNotes.filter(n => n.id === results.id).length === 0)
                        updatedNotes.splice(0, 0, results);

                    setNotes(updatedNotes);
                    setLastUpdate(new Date());
                }
            });
        }
    }
    const setTab = index => {
        setLimit(25);
        setActiveView(index);
        setSearchTerm();
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
                                <Input bg="transparent" variant="unstyçed" placeholder={searchTerm === undefined ? activeView === 0 ? intl.formatMessage({ id: 'userSearchHelp' }) : intl.formatMessage({ id: 'noteSearchHelp' }) : intl.formatMessage({ id: 'searchingFor' }, { term: searchTerm })} onKeyUp={k => { if (k.key === "Enter") { performSearch(k.target.value) } }}></Input>
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