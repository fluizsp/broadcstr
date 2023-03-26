import { Avatar, Box, Card, Container, Heading, HStack, Link, List, ListIcon, ListItem, SlideFade, Text, UnorderedList, useColorModeValue } from "@chakra-ui/react"
import { useEffect } from "react";
import { BiBitcoin, BiKey, BiNetworkChart, BiShield } from "react-icons/bi";
import { Link as DomLink } from "react-router-dom";

const AboutContainer = (props) => {
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    useEffect(() => {
        document.title = "Broadcstr - About"
    }, [])
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px' }} >
                <SlideFade in={true} offsetX="-1000" offsetY="0" unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        <Card p={12} bg={uiColor}>
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
                                Version <strong>0.4</strong> - Badges, new Relay Service and NIP-36!
                                <br />Features and fixes implemented on this version:
                                <UnorderedList spacing={2} p={2}>
                                    <ListItem>
                                        <strong>Badges!</strong> Initial implementation of Badges, you can now see users badges in profile pages (soon there will be a badges section on user profile, coming in 0.4.x);
                                    </ListItem>
                                    <ListItem>
                                        <strong>QoL changes:</strong> Completely rewritten relay interation through websockets, with individual subscription lifespan and timeout to improve content consistency, time to load and fine tuning for each request/sub;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Content Load:</strong> Moved content load to containers, and removed a lot of content from redux state;
                                    </ListItem>
                                    <ListItem>
                                        <strong>PWA:</strong> Reviewed PWA Configuration so users can add the app to their home screens;
                                    </ListItem>
                                    <ListItem>
                                        <strong>NIP-36 (NSFW):</strong> Implemented NIP-36 on posts/notes, to obfuscate flagged sensitive content and added the flag on composer, so users can safely post NSFW content if they will;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Fixes:</strong> Other minor performance fixes and changes;
                                    </ListItem>
                                </UnorderedList>
                            </Text>
                            <Text p={2}>
                                Version <strong>0.3</strong> - Updates and fixes!
                                <br />Features and fixes implemented on this version:
                                <UnorderedList spacing={2} p={2}>
                                    <ListItem>
                                        <strong>⚡ ZAPS!</strong> First implementation of zaps! Show total zaps of notes and zap others;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Localization:</strong> Localization structure and preparation;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Likes/Replies/Zaps:</strong> Showing like/replies/zaps amount in feeds (still experimental);
                                    </ListItem>
                                    <ListItem>
                                        <strong>Anonymous navigation:</strong> Navigation without a npub/nsec/extension (with limited options);
                                    </ListItem>
                                    <ListItem>
                                        <strong>Reviewed cache:</strong> Changed how state is stored and loaded from/to cache;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Fixes:</strong> Minor fixes and adjustments;
                                    </ListItem>
                                </UnorderedList>
                            </Text>
                            <Text p={2}>
                                Version <strong>0.2</strong> - Updates and fixes!
                                <br />Features and fixes implemented on this version:
                                <UnorderedList spacing={2} p={2}>
                                    <ListItem>
                                        <strong>New Welcome/Account/Login flow:</strong> Cleaner and simpler login and new account flow to reduce complexity for the new user;
                                    </ListItem>
                                    <ListItem>
                                        <strong>New FOR YOU feed:</strong> In order to improve quality and diversity of home feed;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Latest profile information:</strong> Fixed a bug where old profile information was replacing newer profile information;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Image view:</strong> Added a feature to expand image clicking on it for better readability;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Searching for nip-05:</strong> Querying domains in nip-05 search for faster return;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Longer notes:</strong> Automatic collapsing longer content and allowing to expand/collapse it;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Pagination fixes:</strong> Improved pagination on some views;
                                    </ListItem>
                                    <ListItem>
                                        <strong>Small fixes:</strong> And other small fixes;
                                    </ListItem>
                                </UnorderedList>
                            </Text>
                            <Text p={2}>
                                Version <strong>0.1</strong> - First Release!
                                <br />Main features/nips implemented on this version:
                                <UnorderedList spacing={2} p={2}>
                                    <ListItem>
                                        <strong>Account creation/Login:</strong> Generating keys, and login with NSEC or browser extension;
                                    </ListItem>
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
                            <Link as={DomLink} to="/fluizsp@nostrplebs.com">
                                <HStack mt={6}>
                                    <Avatar size="md" src="https://nostr.build/i/nostr.build_c14cfa2a4390af9567da290ef27c790af7ca0595308fdca862fa175c4bbedb89.jpg" name="Fábio Luiz" />
                                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">Fábio Luiz</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">@fluizsp</Text>
                                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1" fontSize="sm">🇧🇷</Text>
                                </HStack>
                            </Link>
                            <Heading size="sm" mt={6}>Official profile:</Heading>
                            <Link as={DomLink} to="/npub1twaca974c690c68yd4lctzh0cu73v8y9ye8mlwvaj8kc80cmn53ssyn72l">
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