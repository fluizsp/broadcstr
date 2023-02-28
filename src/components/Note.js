import { Box, HStack, VStack, Fade, Button, Avatar, Text, Grid, GridItem, Card, Image, Tooltip, useColorModeValue, Link, Flex, Popover, PopoverTrigger, PopoverContent, PopoverArrow } from '@chakra-ui/react'
import { FiMaximize } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost } from 'react-icons/bi';
import { IoIosHeart } from 'react-icons/io';
import { formatDistanceStrict } from 'date-fns'
import { nip19 } from 'nostr-tools';
import { Link as DomLink, useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import { useDispatch, useSelector } from 'react-redux';
import MentionTag from './MentionTag';
import { HiLightningBolt, HiReply } from 'react-icons/hi';
import { addNoteRelatedToload, likeNote, REPLY_TO, repostNote, VIEW_IMAGE } from '../actions/relay';
import { GoBroadcast, GoCheck } from 'react-icons/go';
import { useEffect, useState } from 'react';

const Note = props => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [reposted, setReposted] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const alphaGradient = useColorModeValue('linear(to-t, brand.lightUi 75%, brand.lightUiAlpha 100%)', 'linear(to-t, brand.darkUi 75%, brand.darkUiAlpha 100%)');
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    let note = props.note ?? {};
    let reposted_by = props.note.reposted_by;
    let authorMetadata = useSelector(state => state.user.usersMetadata[note.pubkey], (a, b) => { return a && b && a.name === b.name }) ?? {};
    let responseTags = note.eTags ?? [];
    let responseUserTags = note.pTags ?? [];
    let relateds = useSelector(state => state.content.allNotesRelateds[note.id]) ?? {};
    let liked = useSelector(state => state.user.likes.filter(l => l === note.id).length > 0);
    const account = useSelector(state => state.user.account);
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
    let totalZaps = relateds.zaps ? relateds.zaps.reduce((total, zap) => total += zap.amount, 0) : 0;
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
        dispatch(likeNote(note));
    }
    const repost = () => {
        dispatch(repostNote(note));
        setReposted(true);
    }
    const viewImage = (imageSrc) => {
        dispatch({ type: VIEW_IMAGE, data: imageSrc });
    }
    const handleClick = url => {
        let selection = window.getSelection().toString();
        if (selection.length === 0)
            navigate(url);
    }
    const handleZap = amount => {
        console.log(amount);
        console.log(authorMetadata.lud16);
    }
    //console.log("Render Note");
    return (
        < Fade in={true}>
            <Card mb="5" bg={uiColor} ml={props.isReply ? replyLevel * 10 + 'px' : 0} >
                <VStack align="left">
                    <Box p="5" pb="0">
                        <Grid templateColumns='repeat(12, 1fr)'>
                            <GridItem colSpan="11">
                                <HStack cursor="pointer" onClick={() => { navigate(`/${authorMetadata.nip05 ?? nip19.npubEncode(note.pubkey)}`) }}>
                                    <Avatar size="md" src={authorMetadata.picture ?? ''} name={authorMetadata.display_name ?? authorMetadata.name ?? ''} />
                                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{authorMetadata.display_name ?? authorMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">{authorMetadata.nip05 ?? authorMetadata.name ? authorMetadata.name : ''}</Text>
                                    <Text fontSize="md" as="b">&middot;</Text>
                                    <Tooltip label={format(created, 'yyyy/MM/dd HH:mm')}>
                                        <Text fontSize="sm">{timeDistance}</Text>
                                    </Tooltip>
                                </HStack>
                            </GridItem>
                            <GridItem align="right">
                                {!props.isThread ? <Tooltip label="View full note" fontSize='md' hasArrow={true}>
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
                                Replying to
                            </Text>
                            <MentionTag href={`/note/${nip19.noteEncode(responseTags[0])}`} publicKeyHex={responseUserTags.slice(-1).pop()} />
                        </HStack>
                        : ''}
                    {reposted_by ?
                        <HStack p="5" h="5" spacing={1}>
                            <GoBroadcast />
                            <Text fontSize="xs" color="gray.500">
                                Broadcstd By
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
                            <Button variant="ghost" onClick={() => { setExpanded(!expanded) }}>{expanded ? 'Show Less...' : 'Show more...'}</Button>
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
                            <Tooltip label={liked ? "You liked!" : "Like"} fontSize='md' hasArrow={true}>
                                <Button isDisabled={!account.publicKey || liked} leftIcon={liked ? <IoIosHeart color="red" /> : <BiHeart />} onClick={like} variant="ghost" size="md">{relateds.likes ? relateds.likes.length : ""}</Button>

                            </Tooltip>
                            <Popover>
                                <PopoverTrigger>
                                    <Tooltip label=" Zaps Coming soon!" fontSize='md' hasArrow={true}>
                                        <Button isDisabled leftIcon={<HiLightningBolt />} variant="ghost" size="md" >{totalZaps > 0 ? totalZaps + totalZapsSuffix : ''}</Button>
                                    </Tooltip>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <Button leftIcon={<HiLightningBolt color="gold" />} variant="ghost" size="md" >Zap 50 Sats</Button>
                                    <Button leftIcon={<HiLightningBolt color="gold" />} variant="ghost" size="md" >Zap 500 Sats</Button>
                                    <Button leftIcon={<HiLightningBolt color="gold" />} variant="ghost" size="md" >Zap 1000 Sats</Button>
                                    <Button leftIcon={<HiLightningBolt color="gold" />} variant="ghost" size="md" >Zap 5000 Sats</Button>
                                    <Button leftIcon={<HiLightningBolt color="gold" />} variant="ghost" size="md" >Zap Custom Sats</Button>
                                </PopoverContent>
                            </Popover>

                            <Tooltip label="Reply" fontSize='md' hasArrow={true}>
                                <Button isDisabled={!account.publicKey} leftIcon={<HiReply />} variant="ghost" size="md" onClick={reply}>{relateds.replies ? relateds.replies.length : ""}</Button>
                            </Tooltip>
                            <Popover>
                                <PopoverTrigger>
                                    <Button isDisabled={!account.publicKey} leftIcon={reposted ? <GoCheck /> : <GoBroadcast />} variant="ghost" size="md" >{relateds.reposts ? relateds.reposts.length : ""}</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <Button onClick={repost} leftIcon={reposted ? <GoCheck /> : <GoBroadcast />} variant="ghost" color={reposted ? 'green.400' : ''} size="md" >{reposted ? 'Brodcstd!' : 'Broadcst this note!'}</Button>
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