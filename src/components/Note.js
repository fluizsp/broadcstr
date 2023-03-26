import { Box, HStack, VStack, Fade, Code, Button, Avatar, Text, Grid, GridItem, Card, Image, Tooltip, useColorModeValue, Link, Popover, PopoverTrigger, PopoverContent, PopoverArrow, useToast, InputGroup, InputLeftAddon, InputRightAddon, Input, Tag, TagLeftIcon, TagLabel } from '@chakra-ui/react'
import { FiMaximize } from 'react-icons/fi';
import { BiHeart, BiMinus, BiPlus } from 'react-icons/bi';
import { IoIosHeart, IoMdPersonAdd, IoMdRemove } from 'react-icons/io';
import { formatDistanceStrict } from 'date-fns'
import { nip19, nip57, getEventHash, nip05 } from 'nostr-tools';
import { Link as DomLink, useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import { useDispatch, useSelector } from 'react-redux';
import MentionTag from './MentionTag';
import { HiLightningBolt, HiReply } from 'react-icons/hi';
import { REPLY_TO, VIEW_IMAGE } from '../actions/relay';
import { GoBroadcast, GoCheck, GoVerified } from 'react-icons/go';
import { useRef, useState } from 'react';
import { Nip57Service } from '../services/Nip57Service';
import { useIntl } from 'react-intl';
import { addFollowing, likeNote, removeFollowing, repostNote, sign } from '../services/ContentServices';
import { FaEye } from 'react-icons/fa';

const Note = props => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const lnRef = useRef(null);
    const intl = useIntl();
    const txtZapAmount = useRef(null);
    const toast = useToast();
    const [reposted, setReposted] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [ln, setLn] = useState(0);
    const [nip05Status, setNip05Status] = useState();
    //const [sensitiveStatus, setSensitiveStatus] = useState(1);
    const [actualZapAmount, setActualZapAmount] = useState(144);

    const [controlledZapAmount, setControlledZapAmount] = useState(144);
    const alphaGradient = useColorModeValue('linear(to-t, brand.lightUi 75%, brand.lightUiAlpha 100%)', 'linear(to-t, brand.darkUi 75%, brand.darkUiAlpha 100%)');
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    let note = props.note ?? {};
    let reposted_by = props.note.reposted_by;
    let authorMetadata = useSelector(state => state.user.usersMetadata[note.pubkey], (a, b) => { return a && b && a.name === b.name }) ?? {};
    let responseTags = note.eTags ?? [];
    let responseUserTags = note.pTags ?? [];
    let isFollowing = useSelector(state => state.user.following.filter(f => f === note.pubkey).length > 0);
    let likes = props.relateds ? props.relateds.likes.length ?? 0 : 0;//useSelector(state => state.content.allNotesRelateds[note.id] ? state.content.allNotesRelateds[note.id].likes ? state.content.allNotesRelateds[note.id].likes.length : 0 : 0);
    let totalZaps = note.zapAmount ? note.zapAmount : props.relateds ? props.relateds.zaps ? props.relateds.zaps.reduce((total, zap) => total += zap.amount, 0) : 0 : 0;//(useSelector(state => state.content.allNotesRelateds[note.id] ? state.content.allNotesRelateds[note.id].zaps ? state.content.allNotesRelateds[note.id].zaps.reduce((total, zap) => total += zap.amount, 0) : 0 : 0))
    let replies = props.relateds ? props.relateds.replies.length ?? 0 : 0;//useSelector(state => state.content.allNotesRelateds[note.id] ? state.content.allNotesRelateds[note.id].replies ? state.content.allNotesRelateds[note.id].replies.length : 0 : 0);
    let reposts = props.relateds ? props.relateds.reposts.length ?? 0 : 0;//useSelector(state => state.content.allNotesRelateds[note.id] ? state.content.allNotesRelateds[note.id].reposts ? state.content.allNotesRelateds[note.id].reposts.length : 0 : 0);
    let sStatus = note.tags ? note.tags.find(t => t[0] === 'content-warning') ? 1 : 0 : 0;
    const [sensitiveStatus, setSensitiveStatus] = useState(sStatus);
    let liked = useSelector(state => state.user.likes.filter ? state.user.likes.filter(l => l === note.id).length > 0 : false);
    const account = useSelector(state => state.user.account);
    const relays = useSelector(state => state.user.relays);
    //console.log(`render note ${note.content}`)
    let created = note ? new Date(note.created_at * 1000) : new Date();
    let timeDistance = formatDistanceStrict(created, new Date(), { addSuffix: false });
    timeDistance = timeDistance.replace(/ hour[s]?/, 'h');
    timeDistance = timeDistance.replace(/ minute[s]?/, 'min');
    timeDistance = timeDistance.replace(/ day[s]?/, 'd');
    timeDistance = timeDistance.replace(/ month[s]?/, 'm');
    timeDistance = timeDistance.replace(/ second[s]?/, 's');
    let replyLevel = responseTags.length ?? 0;
    const lineBreakRgx = /\n/;
    const mentionBreak = /(#\[[0-9]+\])/
    const urlBreak = new RegExp(/(http[s]?:\/\/[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gmi');
    let contentElements = note.content.split(lineBreakRgx);
    contentElements = contentElements.map(element => {
        let innerElements = element.split(mentionBreak).map(mBElement => {
            return mBElement.split(urlBreak).map(uBEllement => {
                return uBEllement;
            }).flat();
        }).flat();
        innerElements.push('\n');
        return innerElements;
    }).flat();
    contentElements = contentElements.map(element => {
        let mention = mentionBreak.exec(element);
        let link = urlBreak.exec(element);
        if (element === '\n')
            return <br />;
        if (mention) {
            let mentionIndex = /#\[([0-9]+)\]/.exec(element)[1];
            let mentioned = note.pTags[mentionIndex];
            return mentioned ? <MentionTag publicKeyHex={mentioned} /> : element;
        }
        else if (link)
            return <Link target="_blank" href={element}>{element}</Link>;
        else
            return element;
    });
    let bigContent = note.content.length > 300;

    let totalZapsSuffix = '';
    if (totalZaps >= 1000000) {
        totalZaps = Math.round(totalZaps / 1000000);
        totalZapsSuffix = 'm';
    }
    if (totalZaps >= 1000) {
        totalZaps = Math.round(totalZaps / 1000);
        totalZapsSuffix = 'k';
    }

    const reply = () => {
        dispatch({ type: REPLY_TO, data: { note: note, author: authorMetadata, originalResponseTags: responseTags } });
    }
    const like = () => {
        likeNote(note);
    }
    const repost = () => {
        repostNote(note);
        setReposted(true);
    }
    const viewImage = (imageSrc) => {
        dispatch({ type: VIEW_IMAGE, data: imageSrc });
    }
    const handleClick = (url, e) => {
        let selection = window.getSelection().toString();
        if (selection.length === 0 && !e.target.className.includes('link'))
            navigate(url);
    }
    const followUnfollow = (isFollowing) => {
        if (!isFollowing)
            followingAdd(note.pubkey);
        else
            followingRemove(note.pubkey)
    }
    const followingAdd = publicKeyHex => {
        addFollowing(publicKeyHex);
    };
    const followingRemove = publicKeyHex => {
        removeFollowing(publicKeyHex);
    };
    const checkNip05 = () => {
        if (authorMetadata.nip05 && authorMetadata.nip05.includes('@'))
            nip05.queryProfile(authorMetadata.nip05).then(value => {
                if (value)
                    setNip05Status(true);
                else
                    setNip05Status(false);
            }).catch(err => {
                setNip05Status(false);
            });
    }
    const dismissSensitiveContent = () => {
        setSensitiveStatus(-1);
    }
    const handleZap = () => {
        let lud16 = authorMetadata.lud16;
        if (!lud16) {
            toast({ description: intl.formatMessage({ id: 'userDontHaveLud16' }, { user: authorMetadata.name ?? nip19.npubEncode(authorMetadata.publicKey) }), status: 'error' });
        }
        Nip57Service.fetchLud16(lud16).then(zapInfo => {
            try {
                let zapRequestInfo = {
                    profile: zapInfo.nostrPubkey,
                    amount: actualZapAmount * 1000,
                    event: note.id,
                    relays: relays.map(r => { return r.url })
                }
                let zapRequest = nip57.makeZapRequest(zapRequestInfo);
                zapRequest.content = '';
                zapRequest.pubkey = nip19.decode(account.publicKey).data;
                zapRequest.id = getEventHash(zapRequest);
                console.log(zapRequest);
                sign(zapRequest, account).then(signedEvent => {
                    Nip57Service.fetchCallback(zapInfo.callback, actualZapAmount * 1000, signedEvent).then(result => {
                        setLn(`lightning:${result.pr}`);
                        setTimeout(() => { lnRef.current.click(); }, 100);
                    });
                }).catch(err => {
                    toast({ description: err.message, status: 'error' });
                });
            } catch (err) {
                toast({ description: err.message, status: 'error' });
            }
        })
    }
    const fibonacciAmount = increase => {
        let newNumber =
            increase ? controlledZapAmount * (1 + Math.sqrt(5)) / 2.0 :
                controlledZapAmount === 1 ? 1 : controlledZapAmount / ((1 + Math.sqrt(5)) / 2);
        setActualZapAmount(Math.round(newNumber));
        setControlledZapAmount(Math.round(newNumber));
        txtZapAmount.current.value = Math.round(newNumber);
    }
    //console.log("Render Note");
    return (
        < Fade in={true}>
            <Card mb="2" bg={uiColor} ml={props.isReply ? replyLevel * 10 + 'px' : 0} pos="relative" >
                {sensitiveStatus === 1 ?
                    <Box pos="absolute" bottom="0" left="0" zIndex="1" p={2} pt="80px" w="100%" h="100%">
                        <Box backdropFilter="auto" backdropBlur="10px" w="100%" h="100%">
                            <Box textAlign="center" pt={10}>
                                <Button onClick={dismissSensitiveContent} leftIcon={<FaEye />}>{intl.formatMessage({ id: 'sensitiveWarning' })}</Button>
                            </Box>

                        </Box>
                    </Box> : ''}

                <VStack align="left">
                    <Box p="5" pb="0">
                        <Grid templateColumns='repeat(12, 1fr)'>
                            <GridItem colSpan="11">
                                <HStack cursor="pointer" onClick={() => { navigate(`/${authorMetadata.nip05 && nip05Status ? authorMetadata.nip05 : nip19.npubEncode(note.pubkey)}`) }}>
                                    <Popover trigger="hover" placement='bottom-start' onOpen={checkNip05}>
                                        <PopoverTrigger>
                                            <HStack>
                                                <Avatar size="md" src={authorMetadata.picture ?? ''} name={authorMetadata.display_name ?? authorMetadata.name ?? ''} />
                                                <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{authorMetadata.display_name ?? authorMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
                                                <Text fontSize="sm" color="gray.400" maxW="150px" noOfLines="1">{authorMetadata.nip05 ?? authorMetadata.name ? authorMetadata.name : ''}</Text>
                                            </HStack>
                                        </PopoverTrigger>
                                        <PopoverContent p={5} w="350px" >
                                            <PopoverArrow />
                                            <HStack>
                                                <Avatar size="md" src={authorMetadata.picture ?? ''} name={authorMetadata.display_name ?? authorMetadata.name ?? ''} />
                                                <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{authorMetadata.display_name ?? authorMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
                                                <Text fontSize="sm" color="gray.400" maxW="150px" noOfLines="1">{authorMetadata.nip05 ?? authorMetadata.name ? authorMetadata.name : ''}</Text>
                                            </HStack>
                                            <Box m={3}>
                                                <Text as="b" color="green.400" fontSize="sm">{authorMetadata.nip05} </Text>
                                                <Tooltip label={nip05Status ? intl.formatMessage({ id: 'nip05Successful' }) : ''}>
                                                    <Tag hidden={!authorMetadata.nip05} color={nip05Status === undefined ? 'gray.400' : nip05Status ? 'green.400' : 'red.500'}>
                                                        {nip05Status ? <TagLeftIcon as={GoVerified} /> : null}
                                                        <TagLabel>{nip05Status === undefined ? intl.formatMessage({ id: 'noNip05' }) : nip05Status ? intl.formatMessage({ id: 'validated' }) : intl.formatMessage({ id: 'validationError' })}</TagLabel>
                                                    </Tag>
                                                </Tooltip>
                                            </Box>
                                            <Text m={3}>{authorMetadata.about}</Text>
                                            <Button m={3} w="200px" isDisabled={!account.publicKey} onClick={followUnfollow.bind(this, isFollowing)} variant="solid" leftIcon={isFollowing ? <IoMdRemove /> : <IoMdPersonAdd />} bgGradient="linear(to-br, brand.purple, brand.green)">{isFollowing ? intl.formatMessage({ id: 'unfollow' }) : intl.formatMessage({ id: 'follow' })}</Button>
                                        </PopoverContent>
                                    </Popover>
                                    <Text fontSize="md" as="b">&middot;</Text>
                                    <Tooltip label={format(created, 'yyyy/MM/dd HH:mm')}>
                                        <Text fontSize="sm">{timeDistance}</Text>
                                    </Tooltip>
                                </HStack>
                            </GridItem>
                            <GridItem align="right">
                                {!props.isThread ? <Tooltip label={intl.formatMessage({ id: 'viewFullNote' })} fontSize='md' hasArrow={true}>
                                    <DomLink to={`/note/${nip19.noteEncode(note.id)}`}>
                                        <Button variant="ghost" size="md"><FiMaximize /></Button>
                                    </DomLink>
                                </Tooltip> : ''}
                            </GridItem>
                        </Grid>
                    </Box>
                    {!props.isReply && responseTags.length > 0 ?
                        <HStack p="5" h="5" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                                {intl.formatMessage({ id: 'replyingTo' })}
                            </Text>
                            <MentionTag href={`/note/${nip19.noteEncode(responseTags[0])}`} publicKeyHex={responseUserTags.slice(-1).pop()} />
                        </HStack>
                        : ''}
                    {reposted_by ?
                        <HStack p="5" h="5" spacing={1}>
                            <GoBroadcast />
                            <Text fontSize="xs" color="gray.500">
                                {intl.formatMessage({ id: 'broadcstdBy' })}
                            </Text>
                            <Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>
                                <MentionTag publicKeyHex={reposted_by} />
                            </Text>
                        </HStack>
                        : ''}
                    <Box position="relative" cursor="pointer" >
                        <Box p="5" pb={expanded ? 20 : null} fontSize={['sm', 'sm', 'md', 'md']} maxH={bigContent && !expanded && !props.isThread ? '200px' : null} overflowY="hidden" onMouseUp={handleClick.bind(this, `/note/${nip19.noteEncode(note.id)}`)}>
                            {contentElements.map(el => {
                                return (el)
                            })}
                        </Box>
                        <Box bgGradient={alphaGradient} hidden={!bigContent || props.isThread} position="absolute" bottom="-4" w="100%" h="65px" p="2">
                            <Button variant="ghost" onClick={() => { setExpanded(!expanded) }}>{expanded ? intl.formatMessage({ id: 'showLess' }) : intl.formatMessage({ id: 'showMore' })}</Button>
                        </Box>
                    </Box>
                    {/*<Code p="5" fontSize={['xs', 'sm', 'md']}>
                        {note.content}
                        </Code>*/}
                    <Image fit="scale-down" maxH="400px" src={note ? note.image : ''} cursor="pointer" onClick={viewImage.bind(this, note.image)} />
                    {note.embed ?
                        note.embed.kind === 'youtube' ?
                            <iframe title={note.embed.src} height="400px" width="100%" src={note.embed.src} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            : note.embed.kind === 'mp4' ? <video src={note.embed.src} muted height="300" width="100%" controls /> : '' : ''}
                    <Box bg={uiColor}>
                        <HStack>
                            <Tooltip label={liked ? intl.formatMessage({ id: 'youLiked' }) : intl.formatMessage({ id: 'like' })} fontSize='md' hasArrow={true}>
                                <Button isDisabled={!account.publicKey || liked} leftIcon={liked ? <IoIosHeart color="red" /> : <BiHeart />} onClick={like} variant="ghost" size="md">{likes > 0 ? likes : ""}</Button>
                            </Tooltip>
                            <Link ref={lnRef} href={ln}></Link>
                            <Popover>
                                <PopoverTrigger>
                                    <Button isDisabled={!account.publicKey} leftIcon={<HiLightningBolt />} variant="ghost" size="md" >{totalZaps > 0 ? totalZaps + totalZapsSuffix : ''}</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <VStack gap="0">
                                        <InputGroup>
                                            <InputLeftAddon><Button variant="ghost" onClick={fibonacciAmount.bind(this, false)}><BiMinus /></Button></InputLeftAddon>
                                            <Input ref={txtZapAmount} defaultValue={actualZapAmount} w="100%" onBlur={e => { setActualZapAmount(e.target.value) }} textAlign="center" />
                                            <InputRightAddon><Button variant="ghost" onClick={fibonacciAmount.bind(this, true)}><BiPlus /></Button></InputRightAddon>
                                        </InputGroup>
                                        <Button w="100%" leftIcon={<HiLightningBolt color="gold" />} rightIcon={<HiLightningBolt color="gold" />} variant="ghost" size="md" onClick={handleZap.bind(this)} >Zap Sats</Button>
                                    </VStack>
                                </PopoverContent>
                            </Popover>

                            <Tooltip label={intl.formatMessage({ id: 'reply' })} fontSize='md' hasArrow={true}>
                                <Button isDisabled={!account.publicKey} leftIcon={<HiReply />} variant="ghost" size="md" onClick={reply}>{replies > 0 ? replies : ""}</Button>
                            </Tooltip>
                            <Popover>
                                <PopoverTrigger>
                                    <Button isDisabled={!account.publicKey} leftIcon={reposted ? <GoCheck /> : <GoBroadcast />} variant="ghost" size="md" >{reposts > 0 ? reposts : ""}</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <Button onClick={repost} leftIcon={reposted ? <GoCheck /> : <GoBroadcast />} variant="ghost" color={reposted ? 'green.400' : ''} size="md" >{reposted ? 'Brodcstd!' : 'Broadcst!'}</Button>
                                </PopoverContent>
                            </Popover>
                        </HStack>
                    </Box>
                </VStack>
            </Card>
        </Fade >
    )
}
export default Note;