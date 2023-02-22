import { Box, HStack, VStack, Fade, Button, Avatar, Text, Grid, GridItem, Card, Image, Tooltip, Input, useColorModeValue, LinkOverlay, LinkBox, Link, Flex } from '@chakra-ui/react'
import { FiMoreHorizontal } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost, BiExpand } from 'react-icons/bi';
import { IoIosHeart } from 'react-icons/io';
import { formatDistanceStrict } from 'date-fns'
import { nip19 } from 'nostr-tools';
import { Link as DomLink, useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import { useSelector } from 'react-redux';
import MentionTag from './MentionTag';
import { HiLightningBolt } from 'react-icons/hi';

const Note = props => {
    const navigate = useNavigate();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    let note = props.note ?? {};
    let reposted_by = props.note.reposted_by;
    let authorMetadata = useSelector(state => state.content.selectedMetadata[note.pubkey], (a, b) => { return a && b && a.name === b.name }) ?? {};
    let content = note.content ?? '';
    const mentionBreak = /(#\[[0-9]+\])/
    content = content.split(mentionBreak);
    let mentionTags = note.pTags ?? [];
    for (let mentionTag = 0; mentionTag < mentionTags.length; mentionTag++) {
        for (let iC = 0; iC < content.length; iC++) {
            if (content[iC] === `#[${mentionTag}]`)
                content[iC] = <MentionTag publicKeyHex={mentionTags[mentionTag]} />;
        }
    }
    let responseTags = note.eTags ?? [];
    let responseUserTags = note.pTags ?? [];
    let liked = useSelector(state => state.user.likes.filter(l => l === note.id).length > 0);
    //console.log(`render note ${note.content}`)
    let created = note ? new Date(note.created_at * 1000) : new Date();
    let timeDistance = formatDistanceStrict(created, new Date(), { addSuffix: false });
    timeDistance = timeDistance.replace(/ hour[s]?/, 'h');
    timeDistance = timeDistance.replace(/ minute[s]?/, 'min');
    timeDistance = timeDistance.replace(/ day[s]?/, 'd');
    timeDistance = timeDistance.replace(/ month[s]?/, 'm');
    timeDistance = timeDistance.replace(/ second[s]?/, 's');

    let replyLevel = responseTags.length ?? 0;
    //console.log("Render Note");
    return (
        <Fade in={true}>
            <Card mb="5" bg={uiColor} ml={props.isReply ? replyLevel * 10 + 'px' : 0} >
                {/*props.isReply ? <Box width="1px" height="110%" borderLeftColor={uiColor} borderLeftWidth={2} borderLeftStyle="dashed" position="absolute" left="-18px"></Box> : ''*/}
                {/*props.isReply ? <Box width="18px" height="1px" borderTopColor={uiColor} borderTopWidth={2} borderTopStyle="dashed" position="absolute" left="-18px" top="44px"></Box> : ''*/}
                <VStack align="left">
                    <Box p="5" pb="0">
                        <Grid templateColumns='repeat(12, 1fr)'>
                            <GridItem colSpan="11">
                                <HStack cursor="pointer" onClick={() => { navigate(`/${authorMetadata.nip05??nip19.npubEncode(note.pubkey)}`) }}>
                                    <Avatar size="md" src={authorMetadata.picture ?? ''} name={authorMetadata.display_name ?? authorMetadata.name ?? ''} />
                                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{authorMetadata.display_name ?? authorMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">@{authorMetadata.name ?? ''}</Text>
                                    <Text fontSize="md" as="b">&middot;</Text>
                                    <Tooltip label={format(created, 'yyyy/MM/dd HH:mm')}>
                                        <Text fontSize="sm">{timeDistance}</Text>
                                    </Tooltip>
                                </HStack>
                            </GridItem>
                            <GridItem align="right">
                                <Button variant="ghost" color="gray.400" alignSelf="right"><FiMoreHorizontal /></Button>
                            </GridItem>
                        </Grid>
                    </Box>
                    {!props.isReply && responseTags.length > 0 ?
                        <HStack p="5" h="5" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                                Replying to
                            </Text>
                            <MentionTag href={`/note/${nip19.noteEncode(responseTags[0])}`} publicKeyHex={responseUserTags.slice(-1).pop()} />
                            {/*<Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>{responseUserTags[0]??'*someone*'}</Text>*/}
                        </HStack>
                        : ''}
                    {reposted_by ?
                        <HStack p="5" h="5" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                                Reposted By
                            </Text>
                            <Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>
                                <MentionTag publicKeyHex={reposted_by} />
                            </Text>
                        </HStack>
                        : ''}
                    <Text p="5" fontSize={['sm', 'sm', 'md', 'md']}>
                        {content.map(c => {
                            return c;
                        })}
                    </Text>
                    {/*<Code p="5" fontSize={['xs', 'sm', 'md']}>
                    {note? JSON.stringify(note) : ''}
                </Code>*/}
                    <Image fit="scale-down" maxH="500px" src={note ? note.image : ''} />
                    {note.embed ?
                        note.embed.kind === 'youtube' ?
                            <iframe title={note.embed.src} height="400px" width="100%" src={note.embed.src} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            : note.embed.kind === 'mp4' ? <video src={note.embed.src} muted height="300" width="100%" controls /> : '' : ''}
                    <Flex bg={uiColor}>
                        <Box w="100px">
                            <Tooltip label={liked ? "You liked!" : "Like"} fontSize='md' hasArrow={true}>
                                <Button isDisabled={liked} variant="ghost" size="md" >{liked ? <IoIosHeart color="red" /> : <BiHeart />}</Button>
                            </Tooltip>
                            <Tooltip label="Zaps (coming soon!)" fontSize='md' hasArrow={true}>
                                <Button variant="ghost" isDisabled size="md" ><HiLightningBolt /></Button>
                            </Tooltip>
                        </Box>
                        <Box flex="1" height="36px">
                            {note.likes && props.isThread ? <Button isDisabled={true} leftIcon={<IoIosHeart />} size="md" variant="ghost">{note.likes}</Button> :
                                null}
                            {note.replies && props.isThread ? <Button isDisabled={true} leftIcon={<BiCommentDetail />} size="md" variant="ghost">{note.replies.length}</Button> :
                                null}
                            {note.reposts && props.isThread ? <Button isDisabled={true} leftIcon={<BiRepost />} size="md" variant="ghost">{note.reposts}</Button> :
                                null}
                            {!props.isReply && !props.isThread ? <Tooltip label="Reply" fontSize='md' hasArrow={true}>
                                {/*<Button leftIcon={<BiCommentDetail />} variant="ghost" size="md">Broadcst your response...</Button>*/}
                                <Input variant="flushed" fontSize="sm" placeholder="Broadcst your response..." size="md"></Input>
                            </Tooltip> : ''}
                        </Box>
                        <Box>
                            {!props.isThread ? <Tooltip label="View full note" fontSize='md' hasArrow={true}>
                                <DomLink to={`/note/${nip19.noteEncode(note.id)}`}>
                                    <Button variant="ghost" size="md"><BiExpand /></Button>
                                </DomLink>
                            </Tooltip> : ''}
                        </Box>
                    </Flex>
                </VStack>
            </Card>
        </Fade>
    )
}
export default Note;