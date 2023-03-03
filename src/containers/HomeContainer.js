import { Center, Box, Button, Container, Spinner, SlideFade, VStack, Flex, Tab, TabList, Tabs, Text } from '@chakra-ui/react'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useColorModeValue } from '@chakra-ui/react';
import { getFollowingFeed, getForYouFeed, getMyInfo, getZapsFeed } from '../actions/relay';

import NoteList from '../components/NoteList';
import { useEffect } from 'react';
import { HiLightningBolt, HiRefresh } from 'react-icons/hi';
import { useLocation, useNavigate } from 'react-router';
import { useIntl } from 'react-intl';

const HomeContainer = props => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const intl=useIntl();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const [feedType, setFeedType] = useState('zaps');
    const [limit, setLimit] = useState(15);
    const account = useSelector(state => state.user.account);
    useEffect(() => {
        setTimeout(() => {
            let initialFeed = location.pathname.includes('following') ? 'following' :
                location.pathname.includes('foryou') ? 'foryou' : 'zaps';
            loadNotes(initialFeed);
            loadMyInfo();
        }, 1000)
        document.title = "Broadcstr"
    }, [])

    const loadMyInfo = () => {
        dispatch(getMyInfo());
    }

    const loadNotes = feedType => {
        setFeedType(feedType);
        switch (feedType) {
            case 'foryou':
                navigate('/foryou');
                dispatch(getForYouFeed(limit + 15))
                break;
            case 'zaps':
                navigate('/');
                dispatch(getZapsFeed(limit + 15));
                break;
            default: //following
                navigate('/following');
                dispatch(getFollowingFeed(limit + 15));
        }
    }
    const moreResults = () => {
        setLimit(limit + 15);
        if (limit > notes.length)
            loadNotes(feedType);
    }
    let notes = [];
    notes = useSelector(state => Object.keys(state.content.feeds[feedType]).map(k => { return state.content.feeds[feedType][k] })
        .filter(note => (note.kind === 1 && note.tags.filter(t => t[0] === "e").length === 0) || note.kind === 6)
        , (a, b) => {
            if (!a)
                return false;
            let aIds = a.map(aNote => { return aNote.id });
            aIds = aIds.join(",");
            let bIds = b.map(bNote => { return bNote.id });
            bIds = bIds.join(",");
            return aIds === bIds;
        })
    let sortedNotes = []
    if (feedType === "zaps") {
        sortedNotes = notes.sort((a, b) => { return parseInt(a.zapAmount) > parseInt(b.zapAmount) ? -1 : 1 })
    } else
        sortedNotes = notes.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="-1000" offsetY="0" unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        <Flex mb="5">
                            <Box bg={uiColor} h="50px" p="2" flex="1">
                                <Center>
                                    <Tabs index={feedType === "following" ? 1 : feedType === 'foryou' ? 2 : 0}>
                                        <TabList>
                                            <Tab onClick={loadNotes.bind(this, 'zaps')}><HiLightningBolt color="gold" /><Text pl={2}>{intl.formatMessage({ id: 'trending' })}</Text></Tab>
                                            <Tab isDisabled={!account.publicKey} onClick={loadNotes.bind(this, 'following')}>{intl.formatMessage({ id: 'following' })}</Tab>
                                            <Tab isDisabled={!account.publicKey} onClick={loadNotes.bind(this, 'foryou')}>{intl.formatMessage({ id: 'foryou' })}</Tab>
                                        </TabList>
                                    </Tabs>
                                </Center>
                            </Box>
                            <Box bg={uiColor} h="50px" pt="2" w="50px">
                                <Button size="sm" variant="ghost" onClick={loadNotes.bind(this, feedType)}><HiRefresh /></Button>
                            </Box>
                        </Flex>
                        <NoteList notes={sortedNotes.slice(0, limit)} />
                        <VStack mb="50px">
                            <Spinner size="xl" color="blue.300" hidden={sortedNotes.length !== 0} />
                            <Button hidden={notes.length === 0 || notes.length < limit} onClick={moreResults.bind(this)} >{intl.formatMessage({ id: 'moreResults' })}</Button>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>
    )
}
export default HomeContainer;