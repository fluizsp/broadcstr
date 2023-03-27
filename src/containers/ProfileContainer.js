import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, useColorModeValue, Grid, GridItem, Avatar, Text, HStack, Tabs, TabList, Tab, Skeleton, Button, Link, Tooltip, Tag, TagLabel, TagLeftIcon, Wrap, WrapItem, TabPanel, TabPanels, Heading, Divider, FormLabel, Input, Textarea, InputGroup, InputRightElement, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, useToast, Popover, PopoverAnchor, PopoverContent, PopoverArrow } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { receivedUserMetadata, RECEIVED_USER_ID } from '../actions/relay';
import { useNavigate, useParams } from 'react-router';
import { nip05, nip19 } from 'nostr-tools';
import NoteList from '../components/NoteList';
import defaultBanner from '../defaultBanner.gif';
import { IoIosCreate, IoMdPersonAdd, IoMdRemove, IoMdSend, IoMdSettings } from 'react-icons/io';
import ContactListItem from '../components/ContactListItem';
import { useIntl } from 'react-intl';
import { GoVerified } from 'react-icons/go';
import { addFollowing, getUserBadges, getUserFollowers, getUserFollowing, getUserNotes, getUserProfileBadges, publishBadge, publishBadgeAward, removeFollowing } from '../services/ContentServices';
import Badge from '../components/Badge';
import { BiBadge, BiBadgeCheck } from 'react-icons/bi';
import { HiBadgeCheck, HiInbox } from 'react-icons/hi';
import { FaGrinBeamSweat } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import sampleBadge from '../samplebadge.jpg';
import { UploadPicture } from '../services/NostrBuildService';

const ProfileContainer = props => {
    const dispatch = useDispatch();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const navigate = useNavigate();
    const myBadgesTabRef = useRef();
    const sentBadgesTabRef = useRef();
    const userSelectTxtRef = useRef();
    const intl = useIntl();
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const toast = useToast();
    const [activeView, setActiveView] = useState(0);
    const [nipInfo, setNipInfo] = useState();
    const [allNotes, setAllNotes] = useState([]);
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [profileBadges, setProfileBadges] = useState([]);
    const [createdBadges, setCreatedBadges] = useState([]);
    const [newBadgeAttrs, setNewBadgeAttrs] = useState({});
    const [newBadgeImageFile, setNewBadgeImageFile] = useState();
    const [newBadgeThumbFile, setNewBadgeThumbFile] = useState();
    const [badgeToAward, setBadgeToAward] = useState();
    const [usersToAward, setUsersToAward] = useState([]);
    const [sentBadges, setSentBadges] = useState([]);
    const [receivedBadges, setReceivedBadges] = useState([]);
    const [mentionTag, setMentionTag] = useState();
    const [mentionActive, setMentionActive] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [limit, setLimit] = useState(25);
    const [nip05Status, setNip05Status] = useState();
    const [publicKeyHex, setPublicKeyHex] = useState(null);
    const mentionedUsers = useSelector(state => {
        if (!mentionTag)
            return [];
        let knownUsers = Object.keys(state.user.usersMetadata).map(k => {
            return { publicKey: k, metadata: state.user.usersMetadata[k] };
        })
        return knownUsers.filter(u => (u.metadata.name && u.metadata.name.includes(mentionTag.replace('@', ''))) || (u.metadata.nip05 && u.metadata.nip05.includes(mentionTag.replace('@', '')))).slice(0, 5);
    });
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
    const loadNotes = (limit) => {
        getUserNotes(publicKeyHex, limit * 5, results => {
            let updatedNotes = notes;
            results.forEach(r => {
                if (notes.filter(n => n.id === r.id).length === 0 && (r.pubkey === publicKeyHex || r.reposted_by === publicKeyHex))
                    updatedNotes.push(r);
            })
            setAllNotes(updatedNotes);
            setLastUpdate(new Date());
        });
    };
    const followingAdd = () => {
        addFollowing(publicKeyHex);
    };
    const followingRemove = () => {
        removeFollowing(publicKeyHex);
    };
    const loadUserFollowing = () => {
        getUserFollowing(publicKeyHex).then(data => {
            if (data.pubkey === publicKeyHex) {
                let followingList = data.tags.map(t => {
                    if (t[0] === "p")
                        return t[1]
                });
                setFollowing(followingList);
                setLastUpdate(new Date());
            }
        })
    };
    const loadUserFollowers = () => {
        getUserFollowers(publicKeyHex, 1000, results => {
            let updatedFollowers = followers;
            results.forEach(r => {
                if (!updatedFollowers.includes(r))
                    updatedFollowers.push(r);
            })
            setFollowers(updatedFollowers);
            setLastUpdate(new Date());
        });
    }
    const loadUserProfileBadges = () => {
        getUserProfileBadges(publicKeyHex, 100, profileBadgesResult => {
            let updatedBadges = profileBadges;
            profileBadgesResult.results.forEach(r => {
                if (!updatedBadges.find(b => b.badge.id === r.badge.id))
                    updatedBadges.push(r);
            })
            //setProfileBadges(updatedBadges);
            //setLastUpdate(new Date());
        });
    }

    const handleKey = event => {
        let mentionRgx = new RegExp(/(@[a-z0-9.-_]+)/)
        let editingMention = event.target.value;
        if (editingMention.substring(0, 4) === 'npub') {
            try {
                let userPubKeyHex = nip19.decode(editingMention).data;
                let updatedUsers = usersToAward;
                if (!updatedUsers.find(u => u.publicKey === userPubKeyHex)) {
                    updatedUsers.push({ npub: editingMention, publicKey: userPubKeyHex, metadata: {} });
                    setUsersToAward(updatedUsers);
                }
                userSelectTxtRef.current.value = '';
            } catch { }
        } else {
            editingMention = editingMention.substring(0, event.target.selectionStart)
            if (editingMention.lastIndexOf('@') !== -1) {
                editingMention = editingMention.substring(editingMention.lastIndexOf('@'));
                if (mentionRgx.exec(editingMention)[0].length === editingMention.length) {
                    setMentionActive(true);
                    setMentionTag(editingMention);
                } else {
                    if (mentionTag !== undefined)
                        setMentionTag();
                    if (mentionActive !== false)
                        setMentionActive(false);
                }
            } else {
                if (mentionTag !== undefined)
                    setMentionTag();
                if (mentionActive !== false)
                    setMentionActive(false);
            }
        }
    }

    const loadUserBadges = () => {
        const userPublicKeyHex = nip19.decode(account.publicKey).data;
        if (userPublicKeyHex === publicKeyHex)
            getUserBadges(userPublicKeyHex, result => {
                switch (result.kind) {
                    case 8:
                        if (result.pubkey === nip19.decode(account.publicKey).data) {
                            let updatedSentBadges = sentBadges;
                            if (!updatedSentBadges.find(u => u.id === result.id))
                                updatedSentBadges.push(result);
                            setSentBadges(updatedSentBadges);
                        }
                        break;
                    case 30009:
                        let updatedCreatedBadges = createdBadges;
                        if (!updatedCreatedBadges.find(b => b.id === result.id))
                            updatedCreatedBadges.push(result);
                        setCreatedBadges(updatedCreatedBadges);
                        setLastUpdate(new Date());
                        break;
                    default:
                        if (result.award) {
                            let updatedReceivedBadges = receivedBadges;
                            if (!updatedReceivedBadges.find(u => u.award.id === result.award.id))
                                updatedReceivedBadges.push(result);
                            setReceivedBadges(updatedReceivedBadges);
                        }
                }
            })
    }

    useEffect(() => {
        console.log('useEffect publicKeyHex');
        if (publicKeyHex) {
            setAllNotes([]);
            setFollowers([]);
            setFollowing([]);
            //setProfileBadges([]);
            setLastUpdate(new Date());
            loadUser();
            loadNotes(25);
            loadUserFollowing();
            loadUserFollowers();
            /*loadUserProfileBadges();
            if (publicKeyHex === nip19.decode(account.publicKey).data)
                loadUserBadges();*/
        }
    }, [publicKeyHex]);
    useEffect(() => {
        setAllNotes([]);
        setFollowers([]);
        setFollowing([]);
        setProfileBadges([]);
        setLastUpdate(new Date());
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
    let userLoaded = Object.keys(user).length > 1 ? true : false;
    let notes = allNotes.filter(n => (n.kind === 1 && n.tags.filter(([t, v]) => t === 'e').length === 0) || n.kind === 6)
        .sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
        .slice(0, limit);
    let replies = allNotes.filter(n => (n.kind === 1 && n.tags.filter(([t, v]) => t === 'e').length > 0));
    let isOwnProfile = account.publicKey && nip19.decode(account.publicKey).data === publicKeyHex;
    let isFollowing = useSelector(state => state.user.following.filter(f => f === publicKeyHex).length > 0);
    const tabSize = isOwnProfile ? '25%' : '25%';
    const setNewBadgeAttr = (attr, value) => {
        let attrs = newBadgeAttrs;
        attrs[attr] = value;
        setNewBadgeAttrs(attrs);
        setLastUpdate(new Date());
    }
    const setNewBadgeImage = event => {
        let attrs = newBadgeAttrs;
        if (event.target.files) {
            attrs.image = URL.createObjectURL(event.target.files[0])
            setNewBadgeImageFile(event.target.files[0]);
        } else if (event.target.value !== "") {
            attrs.image = event.target.value;
            setNewBadgeImageFile(null);
        }
        setNewBadgeAttrs(attrs);
        setLastUpdate(new Date());
    }
    const setNewBadgeThumb = event => {
        let attrs = newBadgeAttrs;
        if (event.target.files) {
            attrs.thumb = URL.createObjectURL(event.target.files[0])
            setNewBadgeThumbFile(event.target.files[0]);
        } else if (event.target.value !== "") {
            attrs.thumb = event.target.value;
            setNewBadgeThumbFile(null);
        }
        setNewBadgeAttrs(attrs);
        setLastUpdate(new Date());
    }
    const previewBadge = {
        kind: 30009,
        pubkey: publicKeyHex,
        created_at: new Date().getTime() / 1000,
        tags: [
            ["d", newBadgeAttrs.id ?? '--'],
            ["name", newBadgeAttrs.name ?? '--'],
            ["description", newBadgeAttrs.description ?? '--'],
            ["image", newBadgeAttrs.image ?? sampleBadge],
            ["thumb", newBadgeAttrs.thumb ?? sampleBadge]
        ]
    }
    const createBadge = async () => {
        let imageUrl = newBadgeAttrs.image ?? '';
        let thumbUrl = newBadgeAttrs.thumb ?? '';
        if (newBadgeImageFile)
            imageUrl = await UploadPicture(newBadgeImageFile);
        if (newBadgeThumbFile)
            thumbUrl = await UploadPicture(newBadgeImageFile);
        let badgeEvent = {
            kind: 30009,
            pubkey: publicKeyHex,
            content: '',
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["d", newBadgeAttrs.id ?? '--'],
                ["name", newBadgeAttrs.name ?? '--'],
                ["description", newBadgeAttrs.description ?? '--'],
                ["image", imageUrl],
                ["thumb", thumbUrl]
            ]
        }
        publishBadge(badgeEvent, createdBadge => {
            let updatedCreatedBadges = createdBadges;
            if (!updatedCreatedBadges.find(b => b.id === createdBadge.id))
                updatedCreatedBadges.push(createdBadge);
            setCreatedBadges(updatedCreatedBadges);
            setLastUpdate(new Date());
            toast({ description: intl.formatMessage({ id: 'badgeCreated' }), status: 'success' });
            myBadgesTabRef.current.click();
        });
    }
    const onUserSelected = user => {
        setMentionActive(false);
        setMentionTag();
        userSelectTxtRef.current.value = '';
        let updatedUsers = usersToAward;
        updatedUsers.push(user);
        setUsersToAward(updatedUsers);
    }
    const deselectUser = user => {
        let updatedUsers = usersToAward.filter(u => u.publicKey !== user.publicKey);
        setUsersToAward(updatedUsers);
    }
    const closeAwardModal = () => {
        setBadgeToAward(null);
    }
    const awardBadge = () => {
        const awardEvent = {
            kind: 8,
            created_at: Math.floor(Date.now() / 1000),
            content: '',
            pubkey: publicKeyHex,
            tags: [
                ["a", `30009:${publicKeyHex}:${badgeToAward.tags.find(t => t[0] === 'd')[1]}`]
            ]
        }
        usersToAward.forEach(u => {
            awardEvent.tags.push([
                "p", u.publicKey
            ])
        })
        publishBadgeAward(awardEvent, publishedEvent => {
            console.log(publishedEvent);
            let updatedSentBadges = sentBadges;
            if (!updatedSentBadges.find(u => u.id === publishedEvent.id))
                updatedSentBadges.push(publishedEvent);
            toast({ description: intl.formatMessage({ id: 'badgeAwarded' }), status: 'success' });
            sentBadgesTabRef.current.click();
        })


    }
    console.log("Render Profile");
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px' }} >
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
                                    <Wrap>
                                        {
                                            profileBadges.map(badgeInfo => {
                                                return <WrapItem><Badge size="xs" badgeInfo={badgeInfo} /></WrapItem>
                                            })
                                        }
                                    </Wrap>
                                </GridItem>
                            </Grid>
                            <Tabs ml="-25px" index={activeView} mt="50px" mr="-25px">
                                <TabList>
                                    <Tab w={tabSize} onClick={() => { setLimit(25); setActiveView(0) }}>{intl.formatMessage({ id: 'notes' })}</Tab>
                                    <Tab w={tabSize} onClick={() => { setLimit(25); setActiveView(1) }}>{intl.formatMessage({ id: 'replies' })}</Tab>
                                    <Tab w={tabSize} onClick={() => { setLimit(25); setActiveView(2) }}> {intl.formatMessage({ id: 'following' })} ({following.length > 1000 ? following.length + '+' : following.length}) </Tab>
                                    <Tab w={tabSize} onClick={() => { setLimit(25); setActiveView(3) }}> {intl.formatMessage({ id: 'followers' })} ({followers.length > 1000 ? followers.length + '+' : followers.length})</Tab>
                                    {/*isOwnProfile ? <Tab w={tabSize} onClick={() => { setActiveView(4) }}>{intl.formatMessage({ id: 'badges' })}</Tab> : ''*/}
                                </TabList>
                            </Tabs>
                        </Card>
                        <SlideFade in={activeView === 0} unmountOnExit>
                            <NoteList notes={notes.slice(0, limit)} />
                        </SlideFade>
                        <SlideFade in={activeView === 1} unmountOnExit>
                            <NoteList notes={replies.slice(0, limit)} />
                        </SlideFade>
                        <SlideFade in={activeView === 2} unmountOnExit>
                            {following.slice(0, limit).map(f => {
                                return <ContactListItem publicKeyHex={f} addFollowing={addFollowing} removeFollowing={removeFollowing} />
                            })}
                        </SlideFade>
                        <SlideFade in={activeView === 3} unmountOnExit>
                            {followers.slice(0, limit).map(f => {
                                return <ContactListItem publicKeyHex={f} addFollowing={addFollowing} removeFollowing={removeFollowing} />
                            })}
                        </SlideFade>
                        <SlideFade in={activeView === 4} unmountOnExit>
                            <Card mb="5" bg={uiColor} p="50" pb={0} mt="10px">
                                <Tabs variant="solid-rounded" defaultIndex={1}>
                                    <TabList>
                                        <Tab><IoIosCreate />&nbsp;{intl.formatMessage({ id: 'create' })}</Tab>
                                        <Tab ref={myBadgesTabRef}><BiBadgeCheck />&nbsp;{intl.formatMessage({ id: 'yourBadges' })}</Tab>
                                        <Tab ref={sentBadgesTabRef}>🏆&nbsp;{intl.formatMessage({ id: 'sent' })}</Tab>
                                        <Tab>🎉&nbsp;{intl.formatMessage({ id: 'received' })}</Tab>
                                    </TabList>
                                    <TabPanels>
                                        <TabPanel p={100}>
                                            <Heading size="md">{intl.formatMessage({ id: 'createABadge' })}:</Heading>
                                            <FormLabel mt={5}>ID:</FormLabel>
                                            <Input variant="flushed" placeholder="nostr-badge-creator" onChange={(e) => { setNewBadgeAttr('id', e.target.value) }}></Input>
                                            <FormLabel mt={5}>{intl.formatMessage({ id: 'name' })}:</FormLabel>
                                            <Input variant="flushed" placeholder='Nostr Badge Creator' onChange={(e) => { setNewBadgeAttr('name', e.target.value) }}></Input>
                                            <FormLabel mt={5}>{intl.formatMessage({ id: 'description' })}:</FormLabel>
                                            <Textarea variant="flushed" placeholder={intl.formatMessage({ id: 'badgeDescriptionPlaceholder' })} onChange={(e) => { setNewBadgeAttr('description', e.target.value) }}></Textarea>
                                            <FormLabel mt={5}>{intl.formatMessage({ id: 'image' })}:</FormLabel>
                                            <InputGroup>
                                                <Input variant="flushed" placeholder={intl.formatMessage({ id: 'enterImageUrl' })} onChange={setNewBadgeImage.bind(this)}></Input>
                                                <InputRightElement>
                                                    <FormLabel htmlFor="badgeImage" bg={uiColor} p={3} cursor="pointer" borderRadius="md"><FiUpload /></FormLabel>
                                                </InputRightElement>
                                            </InputGroup>
                                            <Input id="badgeImage" accept="image/*" type="file" hidden onChange={setNewBadgeImage.bind(this)}></Input>
                                            <FormLabel mt={5}>{intl.formatMessage({ id: 'thumb' })}:</FormLabel>
                                            <InputGroup>
                                                <Input variant="flushed" placeholder={intl.formatMessage({ id: 'enterImageUrl' })} onChange={setNewBadgeThumb.bind(this)}></Input>
                                                <InputRightElement>
                                                    <FormLabel htmlFor="badgeThumb" bg={uiColor} p={3} cursor="pointer" borderRadius="md"><FiUpload /></FormLabel>
                                                </InputRightElement>
                                            </InputGroup>
                                            <Input id="badgeThumb" accept="image/*" type="file" hidden onChange={setNewBadgeThumb.bind(this)}></Input>
                                            <Heading size="md" mt={5}>{intl.formatMessage({ id: 'preview' })}:</Heading>
                                            <VStack spacing={5}>
                                                <Badge badgeInfo={{ badge: previewBadge }} size="xs" />
                                                <Badge badgeInfo={{ badge: previewBadge }} size="sm" />
                                                <Badge badgeInfo={{ badge: previewBadge }} size="md" />
                                                <Badge badgeInfo={{ badge: previewBadge }} size="full" />
                                            </VStack>
                                            <Button onClick={createBadge}>{intl.formatMessage({ id: 'create' })}</Button>
                                        </TabPanel>
                                        <TabPanel p={100} pt={50}>
                                            <Wrap spacing={20}>
                                                {
                                                    createdBadges.map(badge => {
                                                        return <WrapItem>
                                                            <VStack>
                                                                <Badge size="md" badgeInfo={{ badge: badge }} />
                                                                <Button onClick={() => { setBadgeToAward(badge) }}>{intl.formatMessage({ id: 'award' })}</Button>
                                                            </VStack>
                                                        </WrapItem>
                                                    })
                                                }
                                            </Wrap>
                                            <Modal size="lg" isOpen={badgeToAward && badgeToAward.id} bg="none" onClose={closeAwardModal} closeOnEsc closeOnOverlayClick>
                                                <ModalOverlay />
                                                <ModalContent >
                                                    <ModalCloseButton />
                                                    <ModalHeader>{intl.formatMessage({ id: 'awardBadge' })}</ModalHeader>
                                                    <ModalBody pb={10}>
                                                        <Badge size="sm" badgeInfo={{ badge: badgeToAward }} />
                                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'awardTo' })}:</FormLabel>
                                                        <Popover placement="bottom-start" isOpen={mentionActive} autoFocus={false} strategy="fixed">
                                                            <PopoverAnchor>
                                                                <Input ref={userSelectTxtRef} variant="flushed" onKeyUp={handleKey.bind(this)} placeholder={intl.formatMessage({ id: 'awardToPlaceholder' })}></Input>
                                                            </PopoverAnchor>
                                                            <PopoverContent>
                                                                <PopoverArrow />
                                                                <Card p={2}>
                                                                    <FormLabel>{intl.formatMessage({ id: 'awardTo' })}:</FormLabel>
                                                                    {mentionedUsers.map(mentioned => {
                                                                        return (<Button onClick={onUserSelected.bind(this, mentioned)} mb={2}><Avatar src={mentioned.metadata.picture ?? ''} size="xs" mr={2} />{mentioned.metadata.display_name ?? mentioned.metadata.name}</Button>)
                                                                    })}
                                                                </Card>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'selectedUsers' })}:</FormLabel>
                                                        {usersToAward.map(user => {
                                                            return (<WrapItem><Button maxW={200} overflow="hidden" onClick={deselectUser.bind(this, user)} mb={2}><Avatar src={user.metadata.picture ?? ''} size="xs" mr={2} />{user.metadata.display_name ?? user.metadata.name ?? user.npub.substring(0, 10) + '...'}</Button></WrapItem>)
                                                        })}
                                                        <Button mt={5} variant="solid" bgGradient="linear(to-br, brand.purple, brand.green)" onClick={awardBadge}>🏆 {intl.formatMessage({ id: 'award' })}</Button>
                                                    </ModalBody>
                                                </ModalContent>

                                            </Modal>
                                        </TabPanel>
                                        <TabPanel p={100} pt={50}>
                                            <Wrap spacing={20}>
                                                {sentBadges.map(sent => {
                                                    let badgeId = sent.tags.find(t => t[0] === 'a')[1].split(':')[2];
                                                    let badge = createdBadges.find(b => b.tags.find(t => t[0] === 'd')[1] === badgeId);
                                                    return <WrapItem><Badge size="md" badgeInfo={{ badge: badge, award: sent }} /></WrapItem>;
                                                })}
                                            </Wrap>
                                        </TabPanel>
                                        <TabPanel p={100} pt={50}>
                                            <Heading mt={10} size="sm">{intl.formatMessage({ id: 'pendingAcceptance' })}:</Heading>
                                            <Divider />
                                            <Wrap spacing={20} p={5}>
                                                {receivedBadges.map(badgeInfo => {
                                                    return <WrapItem><Badge size="md" badgeInfo={badgeInfo} /></WrapItem>;;
                                                })}
                                            </Wrap>
                                            <Heading mt={10} size="sm">{intl.formatMessage({ id: 'accepted' })}:</Heading>
                                            <Divider />
                                            {
                                                profileBadges.map(badgeInfo => {
                                                    return <WrapItem>
                                                        <VStack>
                                                            <Badge size="md" badgeInfo={badgeInfo} />
                                                            <Button>{intl.formatMessage({ id: 'award' })}</Button>
                                                        </VStack>
                                                    </WrapItem>
                                                })
                                            }
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>
                            </Card>
                        </SlideFade>
                        <VStack>
                            {<Button onClick={moreResults} hidden={(activeView === 0 && notes.length < limit) || (activeView === 1 && replies.length < limit) || activeView === 4}>{intl.formatMessage({ id: 'moreResults' })}</Button>}
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