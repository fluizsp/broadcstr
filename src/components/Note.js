import { Box, HStack, VStack, Button, Avatar, Text, Grid, GridItem, Card, Image, Skeleton } from '@chakra-ui/react'
import { FiMoreHorizontal } from 'react-icons/fi';
import { BiCommentDetail, BiHeart, BiRepost } from 'react-icons/bi';
import { formatDistance } from 'date-fns'

function Note(props) {
    let created = props.note ? new Date(props.note.created_at * 1000) : new Date();
    //console.log(created);
    return (
        <Card mb="5">
            <VStack align="left">
                <Box p="5" pb="0">
                    <Grid templateColumns='repeat(12, 1fr)'>
                        <GridItem colSpan="11">
                            <HStack>
                                <Avatar size="md" name="" />
                                <Text fontSize="md" as="b" maxW="200px" noOfLines="1"><Skeleton w="20" h="2" /></Text>
                                <Text fontSize="md" as="b">&middot;</Text>
                                <Text fontSize="sm" aria-label='aaa'>{formatDistance(created, new Date(), { addSuffix: true})}</Text>
                            </HStack>
                        </GridItem>
                        <GridItem align="right">
                            <Button variant="ghost" color="gray.400" alignSelf="right"><FiMoreHorizontal /></Button>
                        </GridItem>
                    </Grid>
                </Box>
                <Text p="5" fontSize={['xs', 'sm', 'sm','md']}>
                    {props.note ? props.note.content : ''}
                </Text>
                {/*<Code p="5" fontSize={['xs', 'sm', 'md']}>
                    {props.note ? JSON.stringify(props.note) : ''}
                </Code>*/}

                <Image fit="scale-down" maxH="500px" src={props.note ? props.note.image : ''} />
                <HStack p="5" verticalAlign="middle" spacing="2">
                    <Button variant="link"><BiCommentDetail /></Button>
                    <Skeleton w="5" h="2" />
                    <Button variant="link"><BiHeart /></Button>
                    <Skeleton w="5" h="2" />
                    <Button variant="link"><BiRepost /></Button>
                    <Skeleton w="5" h="2" />
                </HStack>
            </VStack>
        </Card>
    )
}
export default Note;