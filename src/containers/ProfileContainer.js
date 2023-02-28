import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Grid, GridItem, Avatar, Text, HStack, Tabs, TabList, Tab, Skeleton, Button, Link } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { addFollowing, getMyInfo, getUserFollowers, getUserFollowing, getUserNotes, receivedUserMetadata, RECEIVED_USER_ID, removeFollowing, SET_LIMIT, UNLOAD_NOTES } from '../actions/relay';
import { useNavigate, useParams } from 'react-router';
import { nip05, nip19 } from 'nostr-tools';
import NoteList from '../components/NoteList';
import defaultBanner from '../defaultBanner.gif';
import { IoMdPersonAdd, IoMdRemove, IoMdSettings } from 'react-icons/io';
import ContactListItem from '../components/ContactListItem';

const ProfileContainer = props => {
    const dispatch = useDispatch();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const navigate = useNavigate();
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [activeView, setActiveView] = useState(0);
    const [nipInfo, setNipInfo] = useState();
    const [limit, setLimit] = useState(25);
    const [publicKeyHex, setPublicKeyHex] = useState(null);
    const moreResults = () => {
        setLimit(limit + 25);
    }
    const followUnfollow = () => {
        if (!isFollowing)
            addFollowing(publicKeyHex);
        else
            removeFollowing(publicKeyHex)
    }
    const loadUser = publicKeyHex => {
        dispatch(receivedUserMetadata(publicKeyHex, { load: true }));
        dispatch({ type: RECEIVED_USER_ID, data: publicKeyHex })
    }
    const loadNotes = (publicKeyHex, limit) => {
        dispatch(getUserNotes(publicKeyHex, limit * 5));
    };
    const addFollowing = publicKeyHex => {
        dispatch(addFollowing(publicKeyHex));
    };
    const removeFollowing = publicKeyHex => {
        dispatch(removeFollowing(publicKeyHex));
    };
    const loadUserFollowing = publicKeyHex => {
        dispatch(getUserFollowing(publicKeyHex));
    };
    const loadUserFollowers = publicKeyHex => {
        dispatch(getUserFollowers(publicKeyHex));
    }
    useEffect(() => {
        console.log('useEffect publicKeyHex');
        if (publicKeyHex) {
            loadUser(publicKeyHex);
            loadNotes(publicKeyHex, 25);
            loadUserFollowing(publicKeyHex);
            loadUserFollowers(publicKeyHex);
        }
    }, [publicKeyHex]);
    useEffect(() => {
        if (!params.id.includes('@') && params.id.includes('npub'))
            setPublicKeyHex(nip19.decode(params.id).data);
        else
            nip05.queryProfile(params.id).then(value => {
                if (value)
                    setPublicKeyHex(value.pubkey);
            })
    }, [params.id]);
    useEffect(() => {
        console.log('useEffect initial')
        window.scrollTo(0, 0);
        document.title = `Brodcstr - Profile - ${params.id}`;
        /*if (!user.account || user.account.publicKey === undefined)
            navigate('/welcome');*/
        if (params.id.includes('@'))
            nip05.queryProfile(params.id).then(value => {
                if (value)
                    setPublicKeyHex(value.pubkey);
                else
                    navigate('/');
            })
        else if (params.id.includes('npub'))
            setPublicKeyHex(nip19.decode(params.id).data);
    }, [])
    const account = useSelector(state => state.user.account);
    let user = useSelector(state => state.user.usersMetadata[publicKeyHex]) ?? {};
    let userLoaded = user.name ? true : false;
    let notes = [];
    let replies = [];
    let isOwnProfile = account.publicKey === publicKeyHex;
    let isFollowing = useSelector(state => state.user.following.filter(f => f === publicKeyHex).length > 0);
    notes = useSelector(state => Object.keys(state.content.allNotes).map(k => { return state.content.allNotes[k] })
        .filter(note => note.pubkey === publicKeyHex || note.reposted_by === publicKeyHex)
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

    replies = useSelector(state => Object.keys(state.content.allNotes).map(k => { return state.content.allNotes[k] })
        .filter(note => note.pubkey === publicKeyHex)
        .filter(note => note.kind === 1 && note.tags.filter(t => t[0] === "e").length > 0)
        .sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        .slice(0, limit * 2), (a, b) => {
            if (!a)
                return false;
            let aIds = a.map(aNote => { return aNote.id });
            aIds = aIds.join(",");
            let bIds = b.map(bNote => { return bNote.id });
            bIds = bIds.join(",");
            return aIds === bIds;
        });
    let following = useSelector(state => state.content.usersFollowing[publicKeyHex]) ?? [];
    let followers = useSelector(state => state.content.usersFollowers[publicKeyHex]) ?? [];
    console.log("Render Profile");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Box className='box1' width="100%" height="300px" mb="-300px"
                        sx={{
                            bgImage: user.banner ?? defaultBanner,
                            bgSize: 'cover',
                            bgPosition: 'center',
                            maskImage: "linear-gradient(180deg, #fff 75%, #ffffff00 100%);"
                        }}>
                    </Box>
                    <Container maxW='4xl' pt="80px" pb="20px" id="d1">

                        <Card mb="5" bg={uiColor} p="50" pb={0} mt="100px">
                            <Grid templateColumns="repeat(12,1fr)">
                                <GridItem colSpan={[12, 4]}>
                                    <VStack gap={5}>
                                        <Avatar size="2xl" src={user.picture} name={user.display_name ?? user.name} />
                                        {isOwnProfile ?
                                            <Button onClick={() => { navigate('/settings') }} variant="solid" leftIcon={<IoMdSettings />} bgGradient="linear(to-br, brand.purple, brand.green)">Settings</Button> :
                                            <Button isDisabled={!account.publicKey} onClick={followUnfollow} variant="solid" leftIcon={isFollowing ? <IoMdRemove /> : <IoMdPersonAdd />} bgGradient="linear(to-br, brand.purple, brand.green)">{isFollowing ? "Unfollow" : "Follow"}</Button>}
                                    </VStack>
                                </GridItem>
                                <GridItem colSpan={[12, 8]} textAlign="left" pl="5">
                                    <HStack mt="5">
                                        {userLoaded ?
                                            <Text fontSize="xl" as="b" maxW="150px" noOfLines="1">{user.display_name ?? user.name ?? "Nostr User"}</Text>
                                            : <Skeleton width="150px" h={4} />}
                                        <Text fontSize="lg" color="gray.400" maxW="150px" noOfLines="1" >@{user.name}</Text>
                                    </HStack>
                                    {userLoaded ?
                                        <Text as="b" color="green.400" fontSize="sm">{user.nip05}</Text>
                                        : <Skeleton width="100px" h={2} mb="5" />}
                                    {userLoaded ?
                                        <Text>{user.about}</Text>
                                        : <Box w="300px">
                                            <Skeleton w="300px" h={3} mb="5" />
                                            <Skeleton w="300px" h={3} mb="5" />
                                        </Box>}
                                    {user.lud16 ? <Link as="b" color="green.400" href={`lightning:${user.lud16}`} fontSize="sm">⚡{user.lud16}</Link> : ''}
                                </GridItem>
                            </Grid>
                            <Tabs ml="-25px" index={activeView} mt="50px" mr="-25px">
                                <TabList>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(0) }}>Notes</Tab>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(1) }}>Replies</Tab>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(2) }}> Following ({following.length}) </Tab>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(3) }}> Followers ({followers.length})</Tab>
                                </TabList>
                            </Tabs>
                        </Card>
                        <SlideFade in={activeView === 0} unmountOnExit>
                            <NoteList notes={notes.slice(0, limit)} />
                        </SlideFade>
                        <SlideFade in={activeView === 1} unmountOnExit>
                            <NoteList notes={replies.slice(0, limit)} />
                        </SlideFade>
                        <SlideFade in={activeView === 2} unmountOnExit >
                            {following.slice(0, limit).map(f => {
                                return <ContactListItem publicKeyHex={f} addFollowing={addFollowing} removeFollowing={removeFollowing} />
                            })}
                        </SlideFade>
                        <SlideFade in={activeView === 3} unmountOnExit >
                            {followers.slice(0, limit).map(f => {
                                return <ContactListItem publicKeyHex={f} addFollowing={addFollowing} removeFollowing={removeFollowing} />
                            })}
                        </SlideFade>
                        <VStack>
                            {<Button onClick={moreResults} hidden={(activeView === 0 && notes.length < limit) || (activeView === 1 && replies.length < limit)}>Show more...</Button>}
                            <Fade in={notes.length === 0 && replies.length === 0 && following.length === 0}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box >

    )
}

export default ProfileContainer;