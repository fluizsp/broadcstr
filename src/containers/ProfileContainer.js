import { Card, Box, Container, Spinner, SlideFade, VStack, Fade, Button, useColorModeValue, Grid, GridItem, Avatar, Text, HStack, Tabs, TabList, Tab } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getMyInfo, getNote, getNoteRelateds, receivedUserMetadata, RECEIVED_USER_ID } from '../actions/relay';
import { getUsersMetadata } from '../actions/relay'
import NoteList from '../components/NoteList';
import { useParams } from 'react-router';
import { nip19 } from 'nostr-tools';

const mapDispatchToProps = (dispatch) => {
    return {
        loadUsersMetadata: () => {
            dispatch(getUsersMetadata());
        },
        loadUser: (pubkey) => {
            dispatch(receivedUserMetadata(pubkey, {load:true}));
            dispatch({ type: RECEIVED_USER_ID, data: pubkey })
        },
        loadMyInfo: (publicKey) => {
            dispatch((getMyInfo(publicKey)));
        },
        loadNote: (id) => {
            dispatch(getNote(id));
        }
    }
};

const mapStateToProps = (state, ownProps) => {

    console.log(state.user.usersMetadata[state.relay.lastUserId])
    return {
        userId: state.relay.lastUserId,
        user: state.user.usersMetadata[state.relay.lastUserId]??{},
        notes: null,
        usersMetadata: state.user.usersMetadata,
        account: state.user.account,
        likes: state.user.likes,
    }
};

const ProfileContainer = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [limit, setLimit] = useState(25);
    const moreResults = () => {
        setLimit(limit + 25);
    }
    useEffect(() => {
        console.log('useEffect');
        let loading = false;
        let userId = nip19.decode(params.id).data;
        if (!props.user || props.userId !== userId) {
            props.loadUser(userId)
            loading = true;
        }

        /*if (!props.note || (!props.note.likes && !props.note.replies && !props.note.reposts)) {
            loading = true
            props.loadNoteRelateds(params.id);
        }*/
        if (!loading)
            setIsLoading(loading);

    }, [params.id, props.userId, props.loadUser]);
    useEffect(() => {
        props.loadMyInfo(props.account.publicKey);
        setInterval(() => {
            props.loadUsersMetadata();
        }, 5000)
    }, [props.loadMyInfo, props.account.publicKey, props.loadUsersMetadata])
    /*let note = props.note ?? {};
    let noteReplies = [];
    if (note.replies)
        noteReplies = [...note.replies];
    let total = noteReplies.length;
    noteReplies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    noteReplies = noteReplies.slice(0, limit);*/
    console.log(props.user);
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Box className='box1' width="100%" height="300px" mb="-300px"
                        sx={{
                            bgImage: props.user.banner,
                            bgSize: 'cover',
                            bgPosition: 'center',
                            maskImage: "linear-gradient(180deg, #fff 25%, #ffffff00 100%);"

                        }}>
                    </Box>
                    <Container maxW='4xl' pt="80px" pb="20px" id="d1">

                        <Card mb="5" bg={uiColor} p="50">
                            <Grid templateColumns="repeat(12,1fr)">
                                <GridItem colSpan={[12, 4]} textAlign="center">
                                    <Avatar size="2xl" src={props.user.picture} name={props.user.display_name??props.user.name} />
                                </GridItem>
                                <GridItem colSpan={[12, 8]} textAlign="left" pl="5">
                                    <HStack>
                                        <Text fontSize="xl" as="b" maxW="150px" noOfLines="1">{props.user.display_name??props.user.name}</Text>
                                        <Text fontSize="lg" color="gray.400" maxW="150px" noOfLines="1" >@{props.user.name}</Text>
                                    </HStack>
                                    <Text as="b" color="green.400" fontSize="sm">{props.user.nip05}</Text>
                                    <Text>{props.user.about}</Text>
                                </GridItem>
                            </Grid>
                        </Card>
                        {/*.box1{
                            mask-image: "linear-gradient(45deg, #fff 50%, #ffffff00 50%);"
                        }
                        .box2{
                            mask-image: "url('https://pbs.twimg.com/profile_banners/758264276/1668885258/600x200)'"
                        */}
                        <Box bg={uiColor} h="50px" p="2" flex="1" borderRadius={5}>

                            <Tabs>
                                <TabList>
                                    <Tab w="25%">Notes</Tab>
                                    <Tab w="25%">Replies</Tab>
                                    <Tab w="25%">Following</Tab>
                                    <Tab w="25%">Followers</Tab>
                                </TabList>
                            </Tabs>
                        </Box>
                        {/*note && note.id ?
                            <NoteList notes={[note]} usersMetadata={props.usersMetadata} isThread={true} likes={props.likes} /> : null*/}
                        {/*noteReplies ?
                            <NoteList notes={noteReplies} usersMetadata={props.usersMetadata} isReply={true} likes={props.likes} /> : null*/}
                        <VStack>
                            {/*total > noteReplies.length ? <Button onClick={moreResults.bind(this)} >Show older replies...</Button> : null*/}
                            <Fade in={isLoading}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>

    )
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileContainer);