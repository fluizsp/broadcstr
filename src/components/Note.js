import { Flex, Center, Box, Image, HStack, VStack, Button, Avatar, Text, Container, Grid, GridItem, Link, Card, Code } from '@chakra-ui/react'
import { FaHashtag, FaPaperclip } from 'react-icons/fa';
import { SearchOutline } from 'react-ionicons'
import { GoHome, GoSettings } from 'react-icons/go';
import { IoMdSettings, Io } from 'react-icons/io';
import { HiPlusCircle } from 'react-icons/hi';
import { FiMoreHorizontal } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost } from 'react-icons/bi';

function Note(props) {
    let created=props.note?new Date(props.note.created_at):new Date();
    return (
        <Card mb="5">
            <VStack align="left">
                <Box p="5" pb="0">
                    <Grid templateColumns='repeat(12, 1fr)'>
                        <GridItem colSpan="11">
                            <HStack>
                                <Avatar size="md" src="https://member.cash/img/profilepics/5579868970219573173.128x128.jpg" />
                                <Text fontSize="md" as="b">{props.note?props.note.pubkey:''}</Text>
                                <Text fontSize="md" as="b">&middot;</Text>
                                <Text fontSize="md">10s</Text>
                            </HStack>
                        </GridItem>
                        <GridItem align="right">
                            <Button variant="ghost" color="gray.400" alignSelf="right"><FiMoreHorizontal /></Button>
                        </GridItem>
                    </Grid>
                </Box>
                <Code p="5" fontSize={['xs','sm','md']}>
                    {props.note?props.note.content:''}
                </Code>
                <Code p="5" fontSize={['xs','sm','md']}>
                    {props.note?JSON.stringify(props.note):''}
                </Code>
                {/*<Image maxH={{ sm: '300px', md: '400px', lg: '500px' }} src="https://pbs.twimg.com/media/FoONMfXXoAIwQVn.jpg" />*/}
                <HStack p="5" verticalAlign="middle" spacing="2">
                    <BiCommentDetail />
                    <Text fontSize="sm" pr="24">3514</Text>
                    <BiHeart/>
                    <Text fontSize="sm" pr="24">3514</Text>
                    <BiRepost />  
                    <Text fontSize="sm">3514</Text>
                </HStack>
            </VStack>
        </Card>
    )
}
export default Note;