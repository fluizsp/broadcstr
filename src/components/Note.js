import { Box, HStack, VStack, Fade, Button, Avatar, Text, Grid, GridItem, Card, Image, Tooltip, Input, useColorModeValue, LinkOverlay, LinkBox } from '@chakra-ui/react'
import { FiMoreHorizontal } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost, BiExpand } from 'react-icons/bi';
import { IoIosHeart } from 'react-icons/io';
import { formatDistanceStrict } from 'date-fns'
import { nip19 } from 'nostr-tools';
import { Link as DomLink, useNavigate } from 'react-router-dom';
import format from 'date-fns/format';

const Note = props => {
    const navigate = useNavigate();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    let note = props.note ?? {};
    //console.log(`render note ${note.content}`)
    let created = note ? new Date(note.created_at * 1000) : new Date();
    let userMetadata = props.authorMetadata;
    let timeDistance = formatDistanceStrict(created, new Date(), { addSuffix: false });
    timeDistance = timeDistance.replace(/ hour[s]?/, 'h');
    timeDistance = timeDistance.replace(/ minute[s]?/, 'min');
    timeDistance = timeDistance.replace(/ day[s]?/, 'd');
    timeDistance = timeDistance.replace(/ month[s]?/, 'm');
    timeDistance = timeDistance.replace(/ second[s]?/, 's');
    return (
        <Fade in={true}>
            <Card mb="5" bg={uiColor} ml={props.isReply ? '24px' : '0'} >
                {props.isReply ? <Box width="1px" height="110%" borderLeftColor={uiColor} borderLeftWidth={2} borderLeftStyle="dashed" position="absolute" left="-18px" top="-20px"></Box> : ''}
                {props.isReply ? <Box width="18px" height="1px" borderTopColor={uiColor} borderTopWidth={2} borderTopStyle="dashed" position="absolute" left="-18px" top="44px"></Box> : ''}
                <VStack align="left">
                    <Box p="5" pb="0">
                        <Grid templateColumns='repeat(12, 1fr)'>
                            <GridItem colSpan="11">
                                <HStack cursor="pointer" onClick={()=>{navigate(`/profile/${nip19.npubEncode(note.pubkey)}`)}}>
                                    <Avatar size="md" src={userMetadata.picture ?? ''} name={userMetadata.display_name ?? userMetadata.name ?? ''} />
                                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{userMetadata.display_name ?? userMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">@{userMetadata.nip05 ? userMetadata.nip05.split('@')[0] : userMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
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
                    {!note.reposted_by && props.eTag ?
                        <HStack p="5" h="5" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                                In response to
                            </Text>
                            <Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>
                                {note.tags.filter(tag => tag[0] === 'p').map(tag => {
                                    let name = props.usersMetadata[tag[1]].name ?? tag[1];
                                    return name
                                }).join(', ')}
                            </Text>
                        </HStack>
                        : ''}
                    {props.reposted_by ?
                        <HStack p="5" h="5" spacing={1}>
                            <Text fontSize="xs" color="gray.500">
                                Reposted By
                            </Text>
                            <Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>
                                {props.reposted_by}
                            </Text>
                        </HStack>
                        : ''}
                    <DomLink to={!props.isThread ? `/note/${note.id}` : null}>
                        <Text p="5" fontSize={['sm', 'sm', 'md', 'md']}>
                            {props.content.map(c => {
                                return c;
                            })}
                        </Text>
                    </DomLink>
                    {/*<Code p="5" fontSize={['xs', 'sm', 'md']}>
                    {note? JSON.stringify(note) : ''}
                </Code>*/}
                    <Image fit="scale-down" maxH="500px" src={note ? note.image : ''} />
                    {note.embed ?
                        note.embed.kind === 'youtube' ?
                            <iframe title={note.embed.src} height="400px" width="100%" src={note.embed.src} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            : note.embed.kind === 'mp4' ? <video src={note.embed.src} height="300" width="100%" controls /> : '' : ''}
                    <Grid templateColumns='repeat(12, 1fr)' bg={uiColor}>
                        <GridItem>
                            <Tooltip label="Like" fontSize='md' hasArrow={true}>
                                <Button isDisabled={props.liked} variant="ghost" size="md" >{props.liked ? <IoIosHeart color="red" /> : <BiHeart />}</Button>
                            </Tooltip>
                        </GridItem>
                        <GridItem colSpan={10} height="36px" alignItems="center">
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
                        </GridItem>
                        <GridItem textAlign="right">
                            {!props.isThread ? <Tooltip label="View full note" fontSize='md' hasArrow={true}>
                                <DomLink to={`/note/${note.id}`}>
                                    <Button variant="ghost" size="md"><BiExpand /></Button>
                                </DomLink>
                            </Tooltip> : ''}
                        </GridItem>
                    </Grid>
                </VStack>
            </Card>
        </Fade>
    )
}
export default Note;