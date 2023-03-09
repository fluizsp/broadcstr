import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Grid, GridItem, Avatar, Text, HStack, Tabs, TabList, Tab, Skeleton, Button, Link, Tooltip, Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { addFollowing, receivedUserMetadata, RECEIVED_USER_ID, removeFollowing, SET_LIMIT, UNLOAD_NOTES } from '../actions/relay';
import { useNavigate, useParams } from 'react-router';
import { nip05, nip19 } from 'nostr-tools';
import NoteList from '../components/NoteList';
import defaultBanner from '../defaultBanner.gif';
import { IoMdPersonAdd, IoMdRemove, IoMdSettings } from 'react-icons/io';
import ContactListItem from '../components/ContactListItem';
import { useIntl } from 'react-intl';
import { GoVerified } from 'react-icons/go';
import { getUserFollowers, getUserFollowing, getUserNotes } from '../services/ContentServices';

const ProfileContainer = props => {
    const dispatch = useDispatch();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const navigate = useNavigate();
    const intl = useIntl();
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [activeView, setActiveView] = useState(0);
    const [nipInfo, setNipInfo] = useState();
    const [allNotes, setAllNotes] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [limit, setLimit] = useState(25);
    const [nip05Status, setNip05Status] = useState();
    const [publicKeyHex, setPublicKeyHex] = useState(null);
    const moreResults = () => {
        setLimit(limit + 25);
    }
    const followUnfollow = (isFollowing) => {
        if (!isFollowing)
            followingAdd(publicKeyHex);
        else
            followingRemove(publicKeyHex)
    }
    const loadUser = publicKeyHex => {
        dispatch(receivedUserMetadata(publicKeyHex, { load: true }));
        dispatch({ type: RECEIVED_USER_ID, data: publicKeyHex })
    }
    const loadNotes = (publicKeyHex, limit) => {
        getUserNotes(publicKeyHex, limit * 5, results => {
            let updatedNotes = notes;
            results.forEach(r => {
                if (notes.filter(n => n.id === r.id).length === 0)
                    updatedNotes.push(r);
            })
            setAllNotes(updatedNotes);
        });
    };
    const followingAdd = publicKeyHex => {
        dispatch(addFollowing(publicKeyHex));
    };
    const followingRemove = publicKeyHex => {
        dispatch(removeFollowing(publicKeyHex));
    };
    const loadUserFollowing = publicKeyHex => {
        getUserFollowing(publicKeyHex).then(data => {
            let followingList = data.tags.map(t => {
                if (t[0] === "p")
                    return t[1]
            });
            setFollowing(followingList);
        })
    };
    const loadUserFollowers = publicKeyHex => {
        getUserFollowers(publicKeyHex, 1000, results => {
            let updatedFollowers = followers;
            results.forEach(r => {
                if (!updatedFollowers.includes(r))
                    updatedFollowers.push(r);
            })
            setFollowers(updatedFollowers);
        });
    }

    useEffect(() => {
        console.log('useEffect publicKeyHex');
        if (publicKeyHex) {
            setAllNotes([]);
            setFollowers([]);
            setFollowing([]);
            loadUser(publicKeyHex);
            loadNotes(publicKeyHex, 25);
            loadUserFollowing(publicKeyHex);
            loadUserFollowers(publicKeyHex);
        }
    }, [publicKeyHex]);
    useEffect(() => {
        setAllNotes([]);
        setFollowers([]);
        setFollowing([]);
        if (!params.id.includes('@') && params.id.includes('npub'))
            setPublicKeyHex(nip19.decode(params.id).data);
        else
            nip05.queryProfile(params.id).then(value => {
                if (value) {
                    setPublicKeyHex(value.pubkey);
                    setNip05Status(true);
                }
            }).catch(() => {
                if (nip05Status !== false)
                    setNip05Status(false);
            });
    }, [params.id]);
    useEffect(() => {
        console.log('useEffect initial')
        window.scrollTo(0, 0);
        document.title = `Brodcstr - Profile - ${params.id}`;
        /*if (!user.account || user.account.publicKey === undefined)
            navigate('/welcome');*/
        if (params.id.includes('@'))
            nip05.queryProfile(params.id).then(value => {
                if (value) {
                    setPublicKeyHex(value.pubkey);
                    setNip05Status(true);
                }
            })
        else if (params.id.includes('npub'))
            setPublicKeyHex(nip19.decode(params.id).data);
    }, [])
    const account = useSelector(state => state.user.account);
    let user = useSelector(state => state.user.usersMetadata[publicKeyHex]) ?? {};
    if (params.id !== user.nip05 && user && user.nip05 && !user.nip05Status) {
        nip05.queryProfile(user.nip05).then(value => {
            if (value) {
                setNip05Status(true);
            }
        }).catch(() => {
            if (nip05Status !== false)
                setNip05Status(false);
        });
    }
    let userLoaded = user.name ? true : false;
    let notes = allNotes.filter(n => (n.kind === 1 && n.tags.filter(([t, v]) => t === 'e').length === 0) || n.kind === 6)
        .sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        .slice(0, limit);
    let replies = allNotes.filter(n => (n.kind === 1 && n.tags.filter(([t, v]) => t === 'e').length > 0));
    let isOwnProfile = account.publicKey && nip19.decode(account.publicKey).data === publicKeyHex;
    let isFollowing = useSelector(state => state.user.following.filter(f => f === publicKeyHex).length > 0);
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
                                            <Button onClick={() => { navigate('/settings') }} variant="solid" leftIcon={<IoMdSettings />} bgGradient="linear(to-br, brand.purple, brand.green)">{intl.formatMessage({ id: 'settings' })}</Button> :
                                            <Button isDisabled={!account.publicKey} onClick={followUnfollow.bind(this, isFollowing)} variant="solid" leftIcon={isFollowing ? <IoMdRemove /> : <IoMdPersonAdd />} bgGradient="linear(to-br, brand.purple, brand.green)">{isFollowing ? intl.formatMessage({ id: 'unfollow' }) : intl.formatMessage({ id: 'follow' })}</Button>}
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
                                        <Box>
                                            <Text as="b" color="green.400" fontSize="sm">{user.nip05} </Text>
                                            <Tooltip label={nip05Status ? intl.formatMessage({ id: 'nip05Successful' }) : ''}>
                                                <Tag color={nip05Status === undefined ? 'gray.400' : nip05Status ? 'green.400' : 'red.500'}>
                                                    {nip05Status ? <TagLeftIcon as={GoVerified} /> : null}
                                                    <TagLabel>{nip05Status === undefined ? intl.formatMessage({ id: 'noNip05' }) : nip05Status ? intl.formatMessage({ id: 'validated' }) : intl.formatMessage({ id: 'validationError' })}</TagLabel>
                                                </Tag>
                                            </Tooltip>
                                        </Box>
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
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(0) }}>{intl.formatMessage({ id: 'notes' })}</Tab>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(1) }}>{intl.formatMessage({ id: 'replies' })}</Tab>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(2) }}> {intl.formatMessage({ id: 'following' })} ({following.length}) </Tab>
                                    <Tab w="25%" onClick={() => { setLimit(25); setActiveView(3) }}> {intl.formatMessage({ id: 'followers' })} ({followers.length})</Tab>
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
                            {<Button onClick={moreResults} hidden={(activeView === 0 && notes.length < limit) || (activeView === 1 && replies.length < limit)}>{intl.formatMessage({ id: 'moreResults' })}</Button>}
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