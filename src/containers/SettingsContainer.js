import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Alert, AlertDescription, AlertIcon, AlertTitle, Avatar, Box, Button, Card, Center, Container, Flex, FormLabel, Grid, GridItem, Heading, HStack, Input, InputGroup, InputLeftElement, InputRightAddon, Select, Show, SlideFade, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Tag, TagLabel, TagLeftIcon, Text, Textarea, Tooltip, useColorMode, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { getPublicKey, nip05, nip19 } from "nostr-tools";
import { useEffect, useState } from "react";
import { FaAdjust, FaGlobe, FaKey, FaPortrait, FaSave, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { GoBroadcast, GoVerified } from "react-icons/go";
import { HiLightningBolt } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import defaultBanner from '../defaultBanner.gif';
import { useNavigate, useParams } from "react-router";
import { LOGOUT, saveToStorage, SAVE_LANGUAGE, setAccount } from "../actions/account";
import { UploadPicture } from "../services/NostrBuildService";
import { useIntl } from "react-intl";

const SettingsContainer = (props) => {
    const dispatch = useDispatch();
    const colorMode = useColorMode();
    const params = useParams();
    const intl = useIntl();
    const toast = useToast();
    const navigate = useNavigate();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const bgGradient = useColorModeValue('linear(to-tl, brand.blessing1, brand.blessing2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const account = useSelector(state => state.user.account);
    const originalRelays = useSelector(state => state.user.relays);
    const oriiginalAccountInfo = useSelector(state => state.user.accountInfo);
    const [newNsec, setNewNsec] = useState();
    const [newRelayUrl, setNewRelayUrl] = useState();
    const [relays, setRelays] = useState(originalRelays);
    const [accountInfo, setAccountInfo] = useState(oriiginalAccountInfo);
    const [newBannerImage, setNewBannerImage] = useState();
    const [newBannerFile, setNewBannerFile] = useState();
    const [newProfileImage, setNewProfileImage] = useState();
    const [newProfileFile, setNewProfileFile] = useState();
    const [nip05Status, setNip05Status] = useState();
    const [language, setLanguage] = useState();
    useEffect(() => {
        if (accountInfo.nip05) {
            nip05.queryProfile(accountInfo.nip05).then(value => {
                if (value && value.pubkey === nip19.decode(account.publicKey).data && !nip05Status)
                    setNip05Status(true);
            }).catch(() => {
                if (nip05Status !== false)
                    setNip05Status(false);
            });
        } else
            setNip05Status();
    }, [accountInfo.nip05])

    useEffect(() => {
        document.title = "Broadcstr - Settings"
    }, [])
    //console.log(nip05Status);
    const copyToClipboard = (type) => {
        switch (type) {
            case 'npub':
                navigator.clipboard.writeText(account.publicKey);
                break;
            case 'nsec':
                navigator.clipboard.writeText(account.privateKey);
                break;
            case 'pubHex':
                navigator.clipboard.writeText(nip19.decode(account.publicKey).data);
                break;
            case 'privHex':
                navigator.clipboard.writeText(nip19.decode(account.privateKey).data);
                break;
            default:
        }
    }
    const SwitchAccount = () => {
        try {
            let newNpub = getPublicKey(nip19.decode(newNsec).data);
            newNpub = nip19.npubEncode(newNpub);
            dispatch({ type: LOGOUT });
            dispatch(setAccount({ publicKey: newNpub, privateKey: newNsec }));
            toast({ description: intl.formatMessage({ id: 'accountSwitched' }), status: "success" });
        } catch {
            toast({ description: intl.formatMessage({ id: 'unableToUsePrivateKey' }), status: "error" });
        }
    }
    const signOut = () => {
        dispatch({ type: LOGOUT });
        navigate('/');
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
        setRelays(relays);
        dispatch(saveToStorage());
        toast({ description: intl.formatMessage({ id: 'relaysSaved' }), status: "success" })
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
    const publishProfile = (accountInfo) => {
        dispatch(setAccount(null, accountInfo));
        dispatch(publishProfile(accountInfo));
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
        publishProfile(newInfo);
    }
    const saveLanguage = () => {
        dispatch({ type: SAVE_LANGUAGE, data: language })
        document.location.reload();
    }
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="-1000" offsetY="0" unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        <Box borderRadius="lg">
                            <Tabs defaultIndex={params.area === 'relays' ? 2 : 0}>
                                <TabList bg={uiColor} borderTopRadius="lg" h={14}>
                                    <Tab isDisabled={!account.publicKey} w="25%" panelId="account">
                                        <FaKey />
                                        <Show above="md">
                                            <Text fontSize="sm" pl={2}>{intl.formatMessage({ id: 'account' })}</Text>
                                        </Show>
                                    </Tab>
                                    <Tab isDisabled={!account.publicKey} w="25%">
                                        <FaPortrait />
                                        <Show above="md">
                                            <Text fontSize="sm" pl={2}>{intl.formatMessage({ id: 'profile' })}</Text>
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
                                            <Text fontSize="sm" pl={2}> {intl.formatMessage({ id: 'preferences' })}</Text>
                                        </Show>
                                    </Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel p="50" bg={uiColor}>
                                        <Heading size="md">{intl.formatMessage({ id: 'keyManagement' })}</Heading>
                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'publicKey' })}:</FormLabel>
                                        <FormLabel mt={2} fontSize="sm">{account.publicKey}</FormLabel>
                                        <Button size="sm" mr="2" onClick={copyToClipboard.bind(this, 'npub')}>{intl.formatMessage({ id: 'copy' })} NPUB</Button>
                                        <Button size="sm" onClick={copyToClipboard.bind(this, 'pubHex')}>{intl.formatMessage({ id: 'copy' })} HEX</Button>
                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'privateKey' })}: ······························</FormLabel>
                                        <Button size="sm" mr="2" onClick={copyToClipboard.bind(this, 'nsec')}>{intl.formatMessage({ id: 'copy' })} NSEC</Button>
                                        <Button size="sm" onClick={copyToClipboard.bind(this, 'privHex')}>{intl.formatMessage({ id: 'copy' })} HEX</Button>
                                        <Heading size="md" mt={5}>{intl.formatMessage({ id: 'switchAndSignOut' })}</Heading>
                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'switchAccounts' })}:</FormLabel>
                                        <InputGroup>
                                            <Input type="password" variant="solid" colorScheme="facebook" onChange={(e) => { setNewNsec(e.target.value) }}></Input>
                                            <InputRightAddon><Button onClick={SwitchAccount}>{intl.formatMessage({ id: 'switchAndSignOut' })}</Button></InputRightAddon>
                                        </InputGroup>
                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'signOut' })}:</FormLabel>
                                        <Alert status='warning' mb={3}>
                                            <AlertIcon />
                                            <AlertDescription>{intl.formatMessage({ id: 'signOutAlert' })}</AlertDescription>
                                        </Alert>
                                        <Button leftIcon={<FaSignOutAlt />} onClick={signOut}>{intl.formatMessage({ id: 'signOut' })}</Button>
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
                                                    <FormLabel htmlFor="bannerImage" bg={uiColor} p={3} cursor="pointer" borderRadius="md">{intl.formatMessage({ id: 'uploadBannerImage' })}</FormLabel>
                                                    <Input id="bannerImage" accept="image/*" type="file" hidden onChange={changeBannerImage.bind(this)}></Input>
                                                    <Input size='xs' w="150px" variant="solid" placeholder={intl.formatMessage({ id: 'enterBannerUrl' })} onBlur={changeBannerImage.bind(this)}></Input>
                                                </VStack>
                                            </Center>

                                        </Box>
                                        <Card m={[5, 5, 50]} mt={[160, 160, 160]} p={[5, 5, 50]} bg={uiColor}>
                                            <Grid templateColumns="repeat(12,1fr)">
                                                <GridItem colSpan={[12, 4]}>
                                                    <VStack gap={2}>
                                                        <Avatar size="2xl" src={newProfileImage ?? accountInfo.picture} name={accountInfo.display_name ?? accountInfo.name} />
                                                        <FormLabel htmlFor="profileImage" bg={uiColor} p={3} cursor="pointer" borderRadius="md">{intl.formatMessage({ id: 'uploadProfileImage' })}</FormLabel>
                                                        <Input size='xs' variant="flushed" placeholder={intl.formatMessage({ id: 'enterProfileUrl' })} onChange={changeProfileImage.bind(this)}></Input>
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
                                                        <Input size="sm" fontWeight="bold" color="green.400" maxW="250px" variant="flushed" defaultValue={accountInfo.nip05} placeholder={intl.formatMessage({ id: 'yourNip05' })} onChange={changeNip05.bind(this)}></Input>
                                                        <Tooltip label={nip05Status ? intl.formatMessage({ id: 'nip05Successful' }) : ''}>
                                                            <Tag color={nip05Status === undefined ? 'gray.400' : nip05Status ? 'green.400' : 'red.500'}>
                                                                {nip05Status ? <TagLeftIcon as={GoVerified} /> : null}
                                                                <TagLabel>{nip05Status === undefined ? intl.formatMessage({ id: 'noNip05' }) : nip05Status ? intl.formatMessage({ id: 'validated' }) : intl.formatMessage({ id: 'validationError' })}</TagLabel>
                                                            </Tag>
                                                        </Tooltip>
                                                    </HStack>
                                                    <Textarea variant="flushed" defaultValue={accountInfo.about} placeholder={intl.formatMessage({ id: 'aboutPlaceholder' })} onChange={changeAbout.bind(this)}></Textarea>
                                                    <InputGroup>
                                                        <InputLeftElement children={<HiLightningBolt color="yellow" />}></InputLeftElement>
                                                        <Input color="green.400" variant="flushed" defaultValue={accountInfo.lud16} placeholder={intl.formatMessage({ id: 'lud16Placeholder' })} onChange={changeLud16.bind(this)}></Input>
                                                    </InputGroup>
                                                </GridItem>
                                            </Grid>
                                            <Box textAlign="right" mt="10">
                                                <Button rightIcon={<GoBroadcast />} bgGradient="linear(to-br, brand.purple, brand.green)" onClick={saveProfile}>Brodcst!</Button>
                                            </Box>
                                        </Card>
                                    </TabPanel >
                                    <TabPanel p="50" bg={uiColor}>
                                        <Heading size="md">{intl.formatMessage({ id: 'relayConfiguration' })}:</Heading>
                                        <Flex p={5}>
                                            <Box flex={1}></Box>
                                            <Box w={24} textAlign="center">{intl.formatMessage({ id: 'read' })}</Box>
                                            <Box w={24} textAlign="center">{intl.formatMessage({ id: 'write' })}</Box>
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
                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'addNewRelay' })}:</FormLabel>
                                        <InputGroup>
                                            <Input placeholder="Url (wss://relay.someawesomeserver.io" onChange={(e) => { setNewRelayUrl(e.target.value) }} />
                                            <InputRightAddon><Button onClick={addRelay} variant="unstyled">{intl.formatMessage({ id: 'add' })}</Button></InputRightAddon>
                                        </InputGroup>
                                        <Box textAlign="right" mt="10">
                                            <Button leftIcon={<FaSave />} bgGradient="linear(to-br, brand.purple, brand.green)" onClick={saveRelays}>{intl.formatMessage({ id: 'saveRelays' })}</Button>
                                        </Box>
                                    </TabPanel>
                                    <TabPanel p="50" bg={uiColor}>
                                        <Heading size="md" >{intl.formatMessage({ id: 'colorMode' })}</Heading>
                                        <FormLabel mt={5}>{intl.formatMessage({ id: 'currentColorMode' }, { mode: colorMode.colorMode === 'light' ? intl.formatMessage({ id: 'light' }) : intl.formatMessage({ id: 'dark' }) })}</FormLabel>
                                        <Button leftIcon={colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />} onClick={colorMode.toggleColorMode}>{intl.formatMessage({ id: 'switchTo' }, { mode: colorMode.colorMode === 'light' ? intl.formatMessage({ id: 'dark' }) : intl.formatMessage({ id: 'light' }) })}</Button>
                                        <Heading size="md" mt={5}>Language</Heading>
                                        <FormLabel mt={5}>Select a new Language</FormLabel>
                                        <Select onChange={e => { setLanguage(e.target.value) }} defaultValue={language}>
                                            <option value="">Detect</option>
                                            <option value="en-US">English</option>
                                            <option value="es-ES">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="pt-BR">Português</option>
                                            <option value="de">Deutsch</option>
                                        </Select>
                                        <Button mt={5} leftIcon={<FaSave />} bgGradient="linear(to-br, brand.purple, brand.green)" onClick={saveLanguage}>Save language configuration</Button>
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

export default SettingsContainer;