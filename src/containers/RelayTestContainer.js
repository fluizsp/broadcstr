import { Box, Button, Card, Container, Flex, Heading, HStack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useColorModeValue, VStack } from "@chakra-ui/react"
import { useState } from "react";
import { BiCircle, BiXCircle } from "react-icons/bi";
import { FaCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { nip19 } from 'nostr-tools';
import NostrRelayService from "../services/NostrRelayService";
import NostrRelayPoolService from "../services/NostrRelayPoolService";

const RelayTestContainer = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const account = useSelector(state => state.user.account);
    const following = useSelector(state => state.user.following);
    const relays = useSelector(state => state.user.relays);
    const [currentRelay, setCurrentRelay] = useState();
    const [pool, setPool] = useState();
    const [events, setEvents] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const selectRelay = url => {
        if (currentRelay)
            currentRelay.close();

        let relay = new NostrRelayService(url);
        setCurrentRelay(relay);
        console.log(relay);
    }
    const selectPool = () => {
        let pool = new NostrRelayPoolService(relays);
        pool.initialize();
        pool.addListener('open', relay => {
            console.log('pool relay opened');
            setLastUpdate(new Date());
        });
        pool.addListener('close', relay => {
            console.log('pool relay closed');
            setLastUpdate(new Date());
        });
        setPool(pool);
    }
    const connect = () => {
        if (currentRelay) {
            currentRelay.addListener('open', relay => {
                setLastUpdate(new Date());
            });
            currentRelay.initialize();
            currentRelay.addListener('close', relay => {
                setLastUpdate(new Date());
            });
        }
    }
    const sendFollowingSub = () => {
        setEvents([]);
        let filters = {
            kinds: [3],
            authors: [nip19.decode(account.publicKey).data]
        };
        let service = pool ?? currentRelay;
        let testSub = service.createSubscription(filters);
        testSub.onEvent(event => {
            console.log('onEvent')
            console.log(event);
            setEvents([...events, event]);
        });
        testSub.onEose(() => {
            console.log('onEose');
        })
    }
    const sendMetadataSub = () => {
        setEvents([]);
        let filters = {
            kinds: [0],
            authors: [nip19.decode(account.publicKey).data]
        };
        let service = pool ?? currentRelay;
        let testSub = service.createSubscription(filters);
        testSub.onEvent(event => {
            console.log('onEvent')
            console.log(event);
            setEvents([...events, event]);
        })
    }
    const sendFeedSub = () => {
        setEvents([]);
        let filters = {
            kinds: [1, 6],
            authors: following
        }
        let service = pool ?? currentRelay;
        let testSub = service.createSubscription(filters);
        testSub.onEvent(event => {
            console.log('onEvent')
            console.log(event);
            setEvents([...events, event]);
        })
    }
    return (
        <Box>
            <Box minH="100vH" bgGradient={bgGradient}>
                <Container maxW='6xl' pt="80px" pb="20px" >
                    <Flex>
                        <Box w="30%" p={2}>
                            <VStack>
                                <Heading size="md">Relays</Heading>
                                {relays.map(r => {
                                    let selected = (currentRelay && currentRelay.url === r.url) || pool;
                                    let status = pool ?
                                        pool.relayServices.filter(s => s.url === r.url).length > 0 ? pool.relayServices.filter(s => s.url === r.url)[0].getStatus() :
                                            currentRelay ? currentRelay.getStatus() : -2 : -2;
                                    return <Button onClick={selectRelay.bind(this, r.url)} rightIcon={selected ? <FaCircle color={status === 1 ? 'green' : status === 3 ? 'red' : 'gray'} /> : <BiCircle />} p="2" w="100%">{r.url}</Button>
                                })}
                                <Button onClick={selectPool.bind(this)} p="2" w="100%">Relay Pool</Button>
                            </VStack>
                        </Box>
                        <Box flex={1} p={2}>
                            <HStack>
                                <Text>{pool ? 'Pool' : currentRelay ? currentRelay.url : ''}</Text>
                                <Heading size="md">Status:</Heading>
                                <Text>{pool ? '' : currentRelay ? currentRelay.getStatus() : -2}</Text>
                                <Button size="sm" onClick={connect}>Connect</Button>
                                <Button size="sm" onClick={sendFollowingSub}>Send Following Sub</Button>
                                <Button size="sm" onClick={sendMetadataSub}>Send Metadata Sub</Button>
                                <Button size="sm" onClick={sendFeedSub}>Send Feed Sub</Button>
                            </HStack>
                            <Heading size="md" mt={5}>Subs:</Heading>
                            <Tabs>
                                <TabList>
                                    <Tab>Sub 01<Button variant="link"><BiXCircle /></Button></Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        {events.map(event => {
                                            return (<Card>{event.content}</Card>)
                                        })}
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    </Flex>
                </Container>
            </Box>
        </Box>
    )
}

export default RelayTestContainer;