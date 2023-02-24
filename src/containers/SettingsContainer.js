import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Avatar, Box, Button, Card, Center, Container, Flex, FormLabel, Grid, GridItem, Heading, HStack, Input, InputGroup, InputLeftElement, InputRightAddon, Show, SlideFade, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, TagLabel, TagLeftIcon, Text, Textarea, Tooltip, useColorMode, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { getPublicKey, nip05, nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { AiOutlineVerified } from "react-icons/ai";
import { FaAdjust, FaGlobe, FaKey, FaPortrait, FaSave, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { GoBroadcast, GoVerified } from "react-icons/go";
import { HiLightningBolt } from "react-icons/hi";
import { connect } from "react-redux";
import defaultBanner from '../defaultBanner.gif';
import { useNavigate, useParams } from "react-router";
import { LOGOUT, saveToStorage, setAccount, SET_RELAYS } from "../actions/account";
import { UploadPicture } from "../services/NostrBuildService";
import { publishProfile } from "../actions/relay";

const mapStateToProps = (state, ownProps) => {
    return {
        account: state.user.account,
        accountInfo: state.user.accountInfo,
        preferences: state.user.preferences ?? {},
        relays: state.user.relays
    }
}

const mapDispatchToProps = () => {
    return ((dispatch, getState) => {
        return {
            signOut: () => {
                dispatch({ type: LOGOUT });
                dispatch(saveToStorage());
            },
            signIn: (account) => {
                dispatch(setAccount(account));
            },
            setRelays: relays => {
                dispatch({ type: SET_RELAYS, data: relays });
            },
            saveProfile: (accountInfo) => {
                dispatch(setAccount(null, accountInfo));
                dispatch(publishProfile(accountInfo));
            },
        };
    });
}

const SettingsContainer = (props) => {
    const colorMode = useColorMode();
    const params = useParams();
    const toast = useToast();
    const navigate = useNavigate();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const [newNsec, setNewNsec] = useState();
    const [newRelayUrl, setNewRelayUrl] = useState();
    const [relays, setRelays] = useState(props.relays);
    const [accountInfo, setAccountInfo] = useState(props.accountInfo);
    const [newBannerImage, setNewBannerImage] = useState();
    const [newBannerFile, setNewBannerFile] = useState();
    const [newProfileImage, setNewProfileImage] = useState();
    const [newProfileFile, setNewProfileFile] = useState();
    const [nip05Status, setNip05Status] = useState();
    useEffect(() => {
        if (accountInfo.nip05) {
            nip05.queryProfile(accountInfo.nip05).then(value => {
                if (value && value.pubkey === nip19.decode(props.account.publicKey).data && !nip05Status)
                    setNip05Status(true);
            }).catch(() => {
                if (nip05Status !== false)
                    setNip05Status(false);
            });
        } else
            setNip05Status();
    }, [accountInfo.nip05])
    //console.log(nip05Status);
    const copyToClipboard = (type) => {
        switch (type) {
            case 'npub':
                navigator.clipboard.writeText(props.account.publicKey);
                break;
            case 'nsec':
                navigator.clipboard.writeText(props.account.privateKey);
                break;
            case 'pubHex':
                navigator.clipboard.writeText(nip19.decode(props.account.publicKey).data);
                break;
            case 'privHex':
                navigator.clipboard.writeText(nip19.decode(props.account.privateKey).data);
                break;
            default:
        }
    }
    const SwitchAccount = () => {
        try {
            let newNpub = getPublicKey(nip19.decode(newNsec).data);
            newNpub = nip19.npubEncode(newNpub);
            props.signOut();
            props.signIn({ publicKey: newNpub, privateKey: newNsec });
            toast({ description: "Account switched sucessfully!", status: "success" });
        } catch {
            toast({ description: "Unable to use private key, check your key and try again.", status: "error" });
        }
    }
    const signOut = () => {
        props.signOut();
        navigate('/welcome');
    }
    const changeReadWrite = (option, relay, control) => {
        let updatedRelays = relays.map(r => {
            if (r.url === relay.url)
                return {
                    url: r.url,
                    read: option === 'read' ? control.target.checked : r.read,
                    write: option === 'write' ? control.target.checked : r.write,
                }
            else
                return r;
        })
        setRelays(updatedRelays);
    }
    const addRelay = () => {
        let updatedRelays = relays.map(r => {
            return r;
        });
        updatedRelays.push({
            url: newRelayUrl,
            read: true,
            write: true
        });
        setRelays(updatedRelays);

    }
    const removeRelay = relay => {
        let updatedRelays = relays.filter(r => r.url !== relay.url);
        setRelays(updatedRelays);
    }
    const saveRelays = () => {
        props.setRelays(relays);
        toast({ description: "Relays configuration saved!", status: "success" })
    }
    const changeBannerImage = event => {
        if (event.target.files) {
            setNewBannerImage(URL.createObjectURL(event.target.files[0]))
            setNewBannerFile(event.target.files[0]);
        } else if (event.target.value !== "")
            setNewBannerImage(event.target.value)
    }
    const changeProfileImage = event => {
        if (event.target.files) {
            setNewProfileImage(URL.createObjectURL(event.target.files[0]))
            setNewProfileFile(event.target.files[0]);
        } else if (event.target.value !== "")
            setNewProfileImage(event.target.value)
    }
    const changeDisplayName = event => {
        let newInfo = {};
        Object.keys(accountInfo).forEach(k => {
            newInfo[k] = accountInfo[k];
        });
        newInfo.display_name = event.target.value;
        setAccountInfo(newInfo);
    }
    const changeName = event => {
        let newInfo = {};
        Object.keys(accountInfo).forEach(k => {
            newInfo[k] = accountInfo[k];
        });
        newInfo.name = event.target.value;
        setAccountInfo(newInfo);
    }
    const changeNip05 = event => {
        let newInfo = {};
        Object.keys(accountInfo).forEach(k => {
            newInfo[k] = accountInfo[k];
        });
        newInfo.nip05 = event.target.value;
        setAccountInfo(newInfo);
    }
    const changeAbout = event => {
        let newInfo = {};
        Object.keys(accountInfo).forEach(k => {
            newInfo[k] = accountInfo[k];
        });
        newInfo.about = event.target.value;
        setAccountInfo(newInfo);
    }
    const changeLud16 = event => {
        let newInfo = {};
        Object.keys(accountInfo).forEach(k => {
            newInfo[k] = accountInfo[k];
        });
        newInfo.lud16 = event.target.value;
        setAccountInfo(newInfo);
    }
    const saveProfile = async () => {
        let newInfo = {};
        console.log(accountInfo);
        Object.keys(accountInfo).forEach(k => {
            newInfo[k] = accountInfo[k];
        });
        if (newProfileFile) {
            let uploadedUrl = await UploadPicture(newProfileFile);
            setNewProfileImage();
            setNewProfileFile();
            newInfo.picture = uploadedUrl;
        } else if (newProfileImage && newProfileImage !== "") {
            newInfo.picture = newProfileImage;
        }
        if (newBannerFile) {
            let uploadedUrl = await UploadPicture(newBannerFile);
            setNewBannerImage();
            setNewBannerFile();
            newInfo.banner = uploadedUrl;
        } else if (newBannerImage && newBannerImage !== "") {
            newInfo.banner = newBannerImage;
        }
        setAccountInfo(newInfo);
        props.saveProfile(newInfo);
    }
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="-1000" offsetY="0" unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        <Box borderRadius="lg">
                            <Tabs defaultIndex={params.area === 'relays' ? 2 : 0}>
                                <TabList bg={uiColor} borderTopRadius="lg" h={14}>
                                    <Tab w="25%" panelId="account">
                                        <FaKey />
                                        <Show above="md">
                                            <Text fontSize="sm" pl={2}> Account</Text>
                                        </Show>
                                    </Tab>
                                    <Tab w="25%">
                                        <FaPortrait />
                                        <Show above="md">
                                            <Text fontSize="sm" pl={2}>Profile</Text>
                                        </Show>
                                    </Tab>
                                    <Tab w="25%" >
                                        <FaGlobe />
                                        <Show above="md">
                                            <Text fontSize="sm" pl={2}>Relays</Text>
                                        </Show>
                                    </Tab>
                                    <Tab w="25%">
                                        <FaAdjust />
                                        <Show above="md">
                                            <Text fontSize="sm" pl={2}> Preferences</Text>
                                        </Show>
                                    </Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel p="50" bg={uiColor}>
                                        <Heading size="md">Key Management</Heading>
                                        <FormLabel mt={5}>Public Key:</FormLabel>
                                        <FormLabel mt={2} fontSize="sm">{props.account.publicKey}</FormLabel>
                                        <Button size="sm" mr="2" onClick={copyToClipboard.bind(this, 'npub')}>Copy NPUB</Button>
                                        <Button size="sm" onClick={copyToClipboard.bind(this, 'pubHex')}>Copy HEX</Button>
                                        <FormLabel mt={5}>Private Key: ······························</FormLabel>
                                        <Button size="sm" mr="2" onClick={copyToClipboard.bind(this, 'nsec')}>Copy NSEC</Button>
                                        <Button size="sm" onClick={copyToClipboard.bind(this, 'privHex')}>Copy HEX</Button>
                                        <Heading size="md" mt={5}>Switch & Sign out</Heading>
                                        <FormLabel mt={5}>Switch accounts (enter new Private Key):</FormLabel>
                                        <InputGroup>
                                            <Input type="password" variant="solid" colorScheme="facebook" onChange={(e) => { setNewNsec(e.target.value) }}></Input>
                                            <InputRightAddon><Button onClick={SwitchAccount}>Switch account</Button></InputRightAddon>
                                        </InputGroup>
                                        <FormLabel mt={5}>Sign Out:</FormLabel>
                                        <Button leftIcon={<FaSignOutAlt />} onClick={signOut}>Sign Out</Button>
                                    </TabPanel>
                                    <TabPanel p={0} mb={50}>
                                        <Box className='box1' width="100%" height="300px" mb="-300px"
                                            sx={{
                                                bgImage: newBannerImage ?? accountInfo.banner ?? defaultBanner,
                                                bgSize: 'cover',
                                                bgPosition: 'center',
                                                maskImage: "linear-gradient(180deg, #fff 75%, #ffffff00 100%);"
                                            }}>
                                            <Center>
                                                <VStack mt="50px">
                                                    <FormLabel htmlFor="bannerImage" bg={uiColor} p={3} cursor="pointer" borderRadius="md">Upload banner image</FormLabel>
                                                    <Input id="bannerImage" accept="image/*" type="file" hidden onChange={changeBannerImage.bind(this)}></Input>
                                                    <Input size='xs' w="150px" variant="solid" placeholder="...or enter image url" onBlur={changeBannerImage.bind(this)}></Input>
                                                </VStack>
                                            </Center>

                                        </Box>
                                        <Card m={[5, 5, 50]} mt={[160, 160, 160]} p={[5, 5, 50]} bg={uiColor}>
                                            <Grid templateColumns="repeat(12,1fr)">
                                                <GridItem colSpan={[12, 4]}>
                                                    <VStack gap={2}>
                                                        <Avatar size="2xl" src={newProfileImage ?? accountInfo.picture} name={accountInfo.display_name ?? accountInfo.name} />
                                                        <FormLabel htmlFor="profileImage" bg={uiColor} p={3} cursor="pointer" borderRadius="md">Upload profile image...</FormLabel>
                                                        <Input size='xs' variant="flushed" placeholder="...or enter image url" onChange={changeProfileImage.bind(this)}></Input>
                                                        <Input id="profileImage" accept="image/*" type="file" hidden onChange={changeProfileImage.bind(this)} hidden></Input>
                                                    </VStack>
                                                </GridItem>
                                                <GridItem colSpan={[12, 8]} textAlign="left" pl="5">
                                                    <HStack mt="5">
                                                        <Input size="lg" fontWeight="bold" maxW="150px" variant="flushed" defaultValue={accountInfo.display_name} placeholder={accountInfo.displayName ?? accountInfo.name ?? 'Nostr User'} onChange={changeDisplayName.bind(this)}></Input>
                                                        <InputGroup>
                                                            <InputLeftElement mt="1" children="@"></InputLeftElement>
                                                            <Input size="lg" fontSize="md" color="gray.400" variant="flushed" defaultValue={accountInfo.name} placeholder="handle" onChange={changeName.bind(this)}></Input>
                                                        </InputGroup>
                                                    </HStack>
                                                    <HStack>
                                                        <Input size="sm" fontWeight="bold" color="green.400" maxW="250px" variant="flushed" defaultValue={accountInfo.nip05} placeholder="your nip05@verified domain" onChange={changeNip05.bind(this)}></Input>
                                                        <Tooltip label={nip05Status ? 'NIP-05 sucessfull validated!' : ''}>
                                                            <Tag color={nip05Status === undefined ? 'gray.400' : nip05Status ? 'green.400' : 'red.500'}>
                                                                {nip05Status ? <TagLeftIcon as={GoVerified} /> : null}
                                                                <TagLabel>{nip05Status === undefined ? 'No nip-05' : nip05Status ? 'Validated' : 'Validation error'}</TagLabel>
                                                            </Tag>
                                                        </Tooltip>
                                                    </HStack>
                                                    <Textarea variant="flushed" defaultValue={accountInfo.about} placeholder="Tell a little about yourself! What your interests and hobbies! Show Nostr users what your profile is up to!" onChange={changeAbout.bind(this)}></Textarea>
                                                    <InputGroup>
                                                        <InputLeftElement children={<HiLightningBolt color="yellow" />}></InputLeftElement>
                                                        <Input color="green.400" variant="flushed" defaultValue={accountInfo.lud16} placeholder="Bitcoin Lightning LUD-06 address" onChange={changeLud16.bind(this)}></Input>
                                                    </InputGroup>
                                                </GridItem>
                                            </Grid>
                                            <Box textAlign="right" mt="10">
                                                <Button leftIcon={<GoBroadcast />} bgGradient="linear(to-br, brand.purple, brand.green)" onClick={saveProfile}>Brodcst profile!</Button>
                                            </Box>
                                        </Card>
                                    </TabPanel >
                                    <TabPanel p="50" bg={uiColor}>
                                        <Heading size="md">Relay configuration:</Heading>
                                        <Flex p={5}>
                                            <Box flex={1}></Box>
                                            <Box w={24} textAlign="center">Read</Box>
                                            <Box w={24} textAlign="center">Write</Box>
                                            <Box w={8} textAlign="center"></Box>
                                        </Flex>
                                        {relays.map(relay => {
                                            return (
                                                <Box bg={uiColor} borderRadius={5} p={5} mb={5}>
                                                    <Flex>
                                                        <Box flex={1}>{relay.url}</Box>
                                                        <Box w={24} textAlign="center"><Switch defaultChecked={relay.read} onChange={changeReadWrite.bind(this, 'read', relay)} /></Box>
                                                        <Box w={24} textAlign="center"><Switch defaultChecked={relay.write} onChange={changeReadWrite.bind(this, 'write', relay)} /></Box>
                                                        <Box w={8} textAlign="center"><Button variant="ghost" size="xs" onClick={removeRelay.bind(this, relay)}><FaTrash /></Button></Box>
                                                    </Flex>
                                                </Box>)
                                        })}
                                        <FormLabel mt={5}>Add a new relay:</FormLabel>
                                        <InputGroup>
                                            <Input placeholder="Relay url (wss://relay.someawesomeserver.io" onChange={(e) => { setNewRelayUrl(e.target.value) }} />
                                            <InputRightAddon><Button onClick={addRelay} variant="unstyled">Add</Button></InputRightAddon>
                                        </InputGroup>
                                        <Box textAlign="right" mt="10">
                                            <Button leftIcon={<FaSave />} bgGradient="linear(to-br, brand.purple, brand.green)" onClick={saveRelays}>Save relay configuration</Button>
                                        </Box>
                                    </TabPanel>
                                    <TabPanel p="50" bg={uiColor}>
                                        <Heading size="md">Color Mode</Heading>
                                        <FormLabel mt={5}>Current color mode is: {colorMode.colorMode}</FormLabel>
                                        <Button leftIcon={colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={colorMode.toggleColorMode}>Switch Color Mode</Button>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    </Container>
                </SlideFade>
            </Box>
        </Box >
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsContainer);