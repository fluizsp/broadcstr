import { Flex, Center, Box, Image, HStack, VStack, Button, Avatar, Text, Container, Grid, GridItem, Link, Card } from '@chakra-ui/react'
import { FaHashtag, FaPaperclip } from 'react-icons/fa';
import { SearchOutline } from 'react-ionicons'
import { GoHome, GoSettings } from 'react-icons/go';
import { IoMdSettings, Io } from 'react-icons/io';
import { HiPlusCircle } from 'react-icons/hi';
import { FiMoreHorizontal } from 'react-icons/fi';

function Note() {
    return (
        <Card mb="5">
            <VStack align="left">
                <Box p="5" pb="0">
                    <Grid templateColumns='repeat(12, 1fr)'>
                        <GridItem colSpan="11">
                            <HStack>
                                <Avatar size="md" src="https://member.cash/img/profilepics/5579868970219573173.128x128.jpg" />
                                <Text fontSize="md" as="b">fluizsp</Text>
                                <Text fontSize="md" as="b">&middot;</Text>
                                <Text fontSize="md">10s</Text>
                            </HStack>
                        </GridItem>
                        <GridItem>
                            <Button variant="ghost" color="gray.400" alignSelf="right"><FiMoreHorizontal /></Button>
                        </GridItem>
                    </Grid>
                </Box>
                <Text p="5" fontSize={{ xs: 'xs', sm: 'xs', md: 'sm' }}>
                    Welcome to Nostr and Broadcstr!<br />
                    <br />
                    What is Nostr?<br />
                    <br />
                    A decentralized network based on cryptographic keypairs and that is not peer-to-peer, it is super simple and scalable and therefore has a chance of working. Read more about the protocol. You can also reach us at our Telegram group (while we don't have a decent group chat application fully working on Nostr).
                </Text>
                <Image maxH={{ sm: '300px', md: '400px', lg: '500px' }} src="https://pbs.twimg.com/media/FoONMfXXoAIwQVn.jpg" />
            </VStack>
        </Card>
    )
}
export default Note;