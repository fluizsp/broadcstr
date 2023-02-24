import { Avatar, Box, Card, Container, Heading, HStack, Link, List, ListIcon, ListItem, SlideFade, Text, UnorderedList, useColorModeValue } from "@chakra-ui/react"
import { useEffect } from "react";
import { BiBitcoin, BiKey, BiNetworkChart, BiShield } from "react-icons/bi";

const AboutContainer = (props) => {
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    useEffect(() => {
        document.title = "Broadcstr - About"
    }, [])
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="-1000" offsetY="0" unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        <Card p={12}>
                            <Heading color="blue.300" size="xl">Welcome to Broadcstr!</Heading>
                            <Heading size="md">and welcome to Nostr!</Heading>
                            <Heading size="md" mt={12}>What is Broadcstr?</Heading>
                            <Text p={2}>
                                Broadcstr is the social media that you control and define the boundaries.
                                <br /><br />
                                It is built using Nostr: A simple, open protocol that enables a truly censorship-resistant and global social network.
                            </Text>
                            <Heading size="md" mt={6}>Why Broadcstr?</Heading>
                            <Text p={2}>
                                Because it is like your social network, but:
                            </Text>
                            <List spacing={2} p={2}>
                                <ListItem>
                                    <ListIcon as={BiShield}></ListIcon>
                                    <strong>Private: </strong>Your account doesn't require e-mails or phone numbers. Start just with your pair of keys;
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={BiNetworkChart}></ListIcon>
                                    <strong>Decentralized: </strong>Censorship resistance means no Big Techs! You control where your consume and post information;
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={BiBitcoin}></ListIcon>
                                    <strong>Value4Value: </strong>Reward your favorite content with Bitcoin Lightning Network! Tip and stack sats;
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={BiKey}></ListIcon>
                                    <strong>Encrypted: </strong>Content are signed with the private key that only you have! And direct messages are encrypted with the same key. No one will ever get into your messages without your authorization. Ever;
                                </ListItem>
                            </List>
                            <Heading size="md" mt={6}>Version info:</Heading>
                            <Text p={2}>
                                Version <strong>0.1.1</strong>
                                <br />Fixes/improvements:
                                <UnorderedList spacing={2} p={2}>
                                    <ListItem>
                                        <strong>Login/Signing with extension:</strong> Support to login and sign events without provide private key, with browser extension (nos2x);
                                    </ListItem>
                                </UnorderedList>
                            </Text>
                            <Text p={2}>
                                Version <strong>0.1.0</strong> - First Release!
                                <br />Main features/nips implemented on this version:
                                <UnorderedList spacing={2} p={2}>
                                    <ListItem>
                                        <strong>Basic Navigation:</strong> Following feed, Profiles, Note details and replies;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Basic interaction:</strong> Like notes, reply to notes, repost notes;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Account Settings:</strong> Manage session and your keys;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Profile editing:</strong> Update your profile details and publish on the network;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Relay preferences:</strong> Manage relays and which of them you want to read/write;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Basic Search:</strong> Search for users using handles/username or NIP-05 and search content with #hashtags;
                                    </ListItem>
                                    <ListItem>
                                        And, of course, <strong>Dark Mode!</strong> Cause we can't live without dark mode;
                                    </ListItem>
                                </UnorderedList>
                            </Text>
                            <Heading size="md" mt={6}>More info:</Heading>
                            <Heading size="sm" mt={6}>Creator:</Heading>
                            <Link href="/fluizsp@nostrplebs.com">
                                <HStack mt={6}>
                                    <Avatar size="md" src="https://member.cash/img/upload/566f881721.webp" name="Fábio Luiz" />
                                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">Fábio Luiz</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">@fluizsp</Text>
                                </HStack>
                            </Link>
                            <Heading size="sm" mt={6}>Official profile:</Heading>
                            <Link href="/npub1twaca974c690c68yd4lctzh0cu73v8y9ye8mlwvaj8kc80cmn53ssyn72l">
                                <HStack mt={6}>
                                    <Avatar size="md" src="https://nostr.build/i/nostr.build_6a5803657dd0a42f6e55d53bc53d43b5f9b1d881f54c7cde1740e81936a25cc3.png" name="Broadcstr" />
                                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">Broadcstr</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">@broadcstr</Text>
                                </HStack>
                            </Link>
                            <Heading size="sm" mt={6}>Support development:</Heading>
                            <Text p={2}>
                                Wants to support development? Send me some Sats :) <Link href="lightning:fluizsp@getalby.com">⚡fluizsp@getalby.com</Link>
                            </Text>

                            <Text mt={6}>
                                Released under MIT license. Code: <Link href="https://github.com/fluizsp/broadcstr" target="_blank">Github</Link>.
                            </Text>
                            <Heading size="md" mt={12}>About Nostr!</Heading>
                            <Text p={2}>
                                Want to know more about Nostr? <Link href="https://nostr.com" target="_blank">Start here</Link>
                            </Text>
                        </Card>
                    </Container>
                </SlideFade>
            </Box>
        </Box>
    )
}

export default AboutContainer