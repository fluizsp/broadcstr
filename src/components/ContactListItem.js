import { Avatar, Button, Card, Grid, GridItem, LinkBox, SlideFade, Text, Tooltip } from "@chakra-ui/react"
import { IoIosMore, IoMdPersonAdd, IoMdRemove } from "react-icons/io"
import { useColorModeValue } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { useNavigate } from "react-router";

const ContactListItem = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const navigate = useNavigate();
    const metadata = useSelector(state => state.content.selectedMetadata[props.publicKeyHex], (a, b) => {
        return a && b && a.name === b.name;
    }) ?? {};
    const isFollowing = useSelector(state => state.user.following.indexOf(props.publicKeyHex) !== -1);
    const followUnfollow = () => {
        if (isFollowing)
            props.removeFollowing(props.publicKeyHex);
        else
            props.addFollowing(props.publicKeyHex);
    }
    const npub = nip19.npubEncode(props.publicKeyHex);
    const displayName = metadata.display_name ?? metadata.name ?? 'Nostr User';
    const name = metadata.name ? '@' + metadata.name : npub;
    return (
        <SlideFade in={true} offsety="500" offsetY="0" unmountOnExit={true}>
            <Card mb="5" bg={uiColor} p="5">
                <Grid templateColumns="repeat(12,1fr)" gap="5">
                    <GridItem>
                        <Avatar size="md" src={metadata.picture} name={displayName} cursor="pointer" onClick={() => { navigate(`/profile/${metadata.nip05??npub}`) }} />
                    </GridItem>
                    <GridItem colSpan="6" cursor="pointer" onClick={() => { navigate(`/profile/${metadata.nip05??npub}`) }}>
                        <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{displayName}</Text>
                        {/*<Skeleton width="150px" h={4} />*/}
                        <Text fontSize="sm" color="gray.400" maxW="150px" noOfLines="1" >{name}</Text>
                    </GridItem>
                    <GridItem p="2" colSpan={5} textAlign="right">
                        <Tooltip label={isFollowing ? "Unfollow" : "Follow"}>
                            <Button onClick={followUnfollow} variant="solid" size="sm" bgGradient="linear(to-br, brand.purple, brand.green)">{isFollowing ? <IoMdRemove /> : <IoMdPersonAdd />}</Button>
                        </Tooltip>
                        <Button variant="ghost" size="sm"><IoIosMore /></Button>
                    </GridItem>
                </Grid>
            </Card>
        </SlideFade>)
}

export default ContactListItem;