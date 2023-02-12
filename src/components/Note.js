import { Box, HStack, VStack, Fade, Button, Avatar, Text, Grid, GridItem, Card, Image, Tooltip, Link } from '@chakra-ui/react'
import { FiMoreHorizontal } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost, BiDetail } from 'react-icons/bi';
import { IoIosHeart } from 'react-icons/io';
import { formatDistance } from 'date-fns'
import { nip19 } from 'nostr-tools';
import { Component } from 'react';

class Note extends Component {

    render() {
        let note = this.props.note ?? {};
        //console.log(`render note ${note.id}`)
        let created = note ? new Date(note.created_at * 1000) : new Date();
        let userMetadata = this.props.authorMetadata;
        return (
            <Fade in={true}>
                <Card mb="5">
                    <VStack align="left">
                        <Box p="5" pb="0">
                            <Grid templateColumns='repeat(12, 1fr)'>
                                <GridItem colSpan="11">
                                    <HStack>
                                        <Avatar size="md" src={userMetadata.picture ?? ''} name={userMetadata.name ?? ''} />
                                        <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{userMetadata.name ?? nip19.npubEncode(note.pubkey)}</Text>
                                        <Text fontSize="md" as="b">&middot;</Text>
                                        <Text fontSize="sm" aria-label='aaa'>{formatDistance(created, new Date(), { addSuffix: true })}</Text>
                                    </HStack>
                                </GridItem>
                                <GridItem align="right">
                                    <Button variant="ghost" color="gray.400" alignSelf="right"><FiMoreHorizontal /></Button>
                                </GridItem>
                            </Grid>
                        </Box>
                        {/*!note.reposted_by && this.props.eTag ?
                            <HStack p="5" h="5" spacing={1}>
                                <Text fontSize="xs" color="gray.500">
                                    In response to
                                </Text>
                                <Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>
                                    {note.tags.filter(tag => tag[0] === 'p').map(tag => {
                                        let name = this.props.usersMetadata[tag[1]].name ?? tag[1];
                                        return name
                                    }).join(', ')}
                                </Text>
                            </HStack>
                                : ''*/}
                        {this.props.reposted_by ?
                            <HStack p="5" h="5" spacing={1}>
                                <Text fontSize="xs" color="gray.500">
                                    Reposted By
                                </Text>
                                <Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>
                                    {this.props.reposted_by}
                                </Text>
                            </HStack>
                            : ''}
                        <Text p="5">
                            {this.props.content.map(c => {
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
                                : note.embed.kind === 'mp4' ? <video src={note.embed.src} height="300" width="100%" controls /> : '' : ''}
                        <HStack p="3" verticalAlign="middle" spacing="5">
                            <Tooltip label="Reply" fontSize='md' hasArrow={true}>
                                <Button variant="ghost" size="lg"><BiCommentDetail /></Button>
                            </Tooltip>
                            {note.replies ? <Text fontSize="sm">{note.replies.length}</Text> :
                                null}
                            <Tooltip label="Like" fontSize='md' hasArrow={true}>
                                <Button isDisabled={this.props.liked} variant="ghost" size="lg" >{this.props.liked ? <IoIosHeart color="red" /> : <BiHeart />}</Button>
                            </Tooltip>
                            {/*note.likes ? <Text fontSize="sm">{note.likes.length}</Text> :
                                <Skeleton w="5" h="2" />*/}
                            <Tooltip label="Repost" fontSize='md' hasArrow={true}>
                                <Button variant="ghost" size="lg"><BiRepost /></Button>
                            </Tooltip>
                            {/*note.reposts ? <Text fontSize="sm">{note.reposts.length}</Text> :
                                <Skeleton w="5" h="2" />*/}
                            <Tooltip label="View full note" fontSize='md' hasArrow={true}>
                                <Button variant="ghost" size="lg"><BiDetail /></Button>
                            </Tooltip>
                        </HStack>
                    </VStack>
                </Card>
            </Fade>
        )
    }
}
export default Note;