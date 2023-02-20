import { Highlight, Link, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { nip19 } from 'nostr-tools';
import { Link as DomLink, useNavigate } from "react-router-dom";
import _ from 'underscore';

const MentionTag = (props) => {
    const navigate=useNavigate();
    let metadata = useSelector(state => state.content.selectedMetadata[props.publicKeyHex], (a, b) => { return a && a.name === b.name }) ?? {}
    //console.log("Render MentionTag");
    if (props.publicKeyHex)
        try {
            return (
                <Link fontSize="sm" as="b" onClick={()=>{navigate(props.href ?? '/profile/' + nip19.npubEncode(props.publicKeyHex))}}>
                    {metadata.display_name ?? '@' + metadata.name ?? nip19.npubEncode(props.publicKeyHex)}
                </Link>
            )
        } catch {
            return <Text as="b" color="blue.300" maxW="150px" noOfLines={1} fontSize="sm">someone</Text>;
        }
}

export default MentionTag;