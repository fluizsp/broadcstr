import { Box, HStack, VStack, Fade, Button, Avatar, Text, Grid, GridItem, Card, Image, Tooltip, Link, Input, LinkBox, LinkOverlay } from '@chakra-ui/react'
import { FiMoreHorizontal } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost, BiDetail, BiExpand } from 'react-icons/bi';
import { IoIosHeart } from 'react-icons/io';
import { formatDistance } from 'date-fns'
import { nip19 } from 'nostr-tools';
import { Component } from 'react';
import { Link as DomLink } from 'react-router-dom';

class Note extends Component {

    render() {
        let note = this.props.note ?? {};
        //console.log(`render note ${note.content}`)
        let created = note ? new Date(note.created_at * 1000) : new Date();
        let userMetadata = this.props.authorMetadata;
        return (
            <Fade in={true}>

                <Card mb="5" bg="whiteAlpha.700" ml={this.props.isReply ? '24px' : '0'}>
                    {this.props.isReply ? <Box width="1px" height="110%" borderLeftColor="gray.300" borderLeftWidth={2} borderLeftStyle="dashed" position="absolute" left="-18px" top="-20px"></Box> : ''}
                    {this.props.isReply ? <Box width="18px" height="1px" borderTopColor="gray.300" borderTopWidth={2} borderTopStyle="dashed" position="absolute" left="-18px" top="44px"></Box> : ''}
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
                        <DomLink to={`/note/${note.id}`}>
                            <Text p="5" fontSize={['sm', 'sm', 'md', 'md']}>
                                {this.props.content.map(c => {
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
                        <Grid templateColumns='repeat(12, 1fr)' bg="white">
                            <GridItem>
                                <Tooltip label="Like" fontSize='md' hasArrow={true}>
                                    <Button isDisabled={this.props.liked} variant="ghost" size="md" >{this.props.liked ? <IoIosHeart color="red" /> : <BiHeart />}</Button>
                                </Tooltip>
                            </GridItem>
                            <GridItem colSpan={10} height="36px" alignItems="center">
                                {note.likes && this.props.isThread ? <Button isDisabled={true} leftIcon={ <IoIosHeart/>} size="md" variant="ghost">{note.likes.length}</Button> :
                                null}
                                {note.replies && this.props.isThread ? <Button isDisabled={true} leftIcon={ <BiCommentDetail/>} size="md" variant="ghost">{note.replies.length}</Button> :
                                null}
                                {note.reposts && this.props.isThread ? <Button isDisabled={true} leftIcon={ <BiRepost/>} size="md" variant="ghost">{note.reposts.length}</Button> :
                                null}
                                {!this.props.isReply && !this.props.isThread ? <Tooltip label="Reply" fontSize='md' hasArrow={true}>
                                    {/*<Button leftIcon={<BiCommentDetail />} variant="ghost" size="md">Broadcst your response...</Button>*/}
                                    <Input variant="flushed" fontSize="sm" placeholder="Broadcst your response..." size="md"></Input>
                                </Tooltip> : ''}
                            </GridItem>
                            <GridItem textAlign="right">
                                {!this.props.isReply ? <Tooltip label="View full note" fontSize='md' hasArrow={true}>
                                    <DomLink to={`/note/${note.id}`}>
                                        <Button variant="ghost" size="md"><BiExpand /></Button>
                                    </DomLink>
                                </Tooltip> : ''}
                            </GridItem>
                            {/*note.replies ? <Text fontSize="sm">{note.replies.length}</Text> :
                                null*/}



                            {/*note.reposts ? <Text fontSize="sm">{note.reposts.length}</Text> :
                                null*/}
                        </Grid>
                    </VStack>
                </Card>
            </Fade>
        )
    }
}
export default Note;