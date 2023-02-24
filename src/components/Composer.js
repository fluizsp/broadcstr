import { Avatar, Box, Button, Card, Flex, FormLabel, HStack, Image, Input, Link, Popover, PopoverAnchor, PopoverArrow, PopoverContent, Text, Textarea, Tooltip, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { format } from "date-fns";
import { nip19 } from "nostr-tools";
import { useRef, useState } from "react";
import { FaFileImage } from "react-icons/fa";
import { GoBroadcast } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { publishNote } from "../actions/relay";
import { treatEmbeds, treatImages } from "../reducers/content";
import { UploadPicture } from "../services/NostrBuildService";
import EmojiPicker from "./EmojiPicker";

const Composer = (props) => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const [draftNote, setDraftNote] = useState({
        pubkey: nip19.decode(props.account.publicKey).data,
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        content: '',
        replyTo: props.replyTo
    });
    const textAreaRef = useRef(null);
    const dispatch = useDispatch();
    const toast = useToast();
    const [editMode, setEditMode] = useState('edit');
    const [mentionActive, setMentionActive] = useState();
    const [mentionTag, setMentionTag] = useState();
    let previewNote = null;
    const updateDraftNote = input => {
        let draft = draftNote;
        draft.content = input.target.value;
        setDraftNote(draft);
    }
    if (editMode === 'preview') {
        previewNote = { content: draftNote.content };
        previewNote = treatImages(previewNote);
        previewNote = treatEmbeds(previewNote);
    }
    const mentionedUsers = useSelector(state => {
        if (!mentionTag)
            return [];
        let knownUsers = Object.keys(state.user.usersMetadata).map(k => {
            return { publicKey: k, metadata: state.user.usersMetadata[k] };
        })
        return knownUsers.filter(u => (u.metadata.name && u.metadata.name.includes(mentionTag.replace('@', ''))) || (u.metadata.nip05 && u.metadata.nip05.includes(mentionTag.replace('@', '')))).slice(0, 5);
    });
    const handleKey = event => {
        let mentionRgx = new RegExp(/(@[a-z0-9.-_]+)/)
        let editingMention = event.target.value;
        editingMention = editingMention.substring(0, event.target.selectionStart)
        if (editingMention.lastIndexOf('@') !== -1) {
            editingMention = editingMention.substring(editingMention.lastIndexOf('@'));
            if (mentionRgx.exec(editingMention)[0].length === editingMention.length) {
                setMentionActive(true);
                setMentionTag(editingMention);
            } else {
                if (mentionTag !== undefined)
                    setMentionTag();
                if (mentionActive !== false)
                    setMentionActive(false);
            }
        } else {
            if (mentionTag !== undefined)
                setMentionTag();
            if (mentionActive !== false)
                setMentionActive(false);
        }
    }

    const onMentionSelected = user => {
        let draft = draftNote;
        draft.content = draft.content.replace(mentionTag, `@${user.metadata.name} `);
        let draftMentionTag = [`@${user.metadata.name}`, user.publicKey];
        !draft.mentionTags ? draft.mentionTags = [draftMentionTag] : draft.mentionTags.push(draftMentionTag);
        setMentionActive(false);
        setMentionTag();
        setDraftNote(draft);
        textAreaRef.current.value = draft.content;
    }

    const addEmoji = emoji => {
        let draft = draftNote;
        draft.content += emoji;
        setDraftNote(draft);
        textAreaRef.current.value = draft.content;
        textAreaRef.current.focus();
    }

    const publish = () => {
        if (draftNote.content !== '') {
            dispatch(publishNote(draftNote));
            toast({ description: 'Note Published!!', status: 'success' });
            if (props.onPublish)
                props.onPublish();
        }
    }
    const uploadNoteImage = async event => {
        if (event.target.files) {
            let uploadedUrl = await UploadPicture(event.target.files[0]);
            let draft = draftNote;
            draft.content += uploadedUrl;
            setDraftNote(draft);
            textAreaRef.current.value = draft.content;
            textAreaRef.current.focus();
        }
    }

    console.log("render Composer")
    return (
        <Card p="5" bg={uiColor} mb={5}>
            <VStack gap={2}>
                <HStack w="100%">
                    <Avatar size="md" src={props.accountInfo.picture ?? ''} name={props.accountInfo.display_name ?? props.accountInfo.name ?? ''} />
                    <Text fontSize="md" as="b" maxW="150px" noOfLines="1">{props.accountInfo.display_name ?? props.accountInfo.name ?? props.account.publicKey}</Text>
                    <Text fontSize="md" color="gray.400" maxW="150px" noOfLines="1">@{props.accountInfo.name ?? ''}</Text>
                    <Text fontSize="md" as="b">&middot;</Text>
                    <Tooltip label={format(new Date(), 'yyyy/MM/dd HH:mm')}>
                        <Text fontSize="sm">just now</Text>
                    </Tooltip>
                </HStack>
                {props.replyTo ?
                    <HStack p="5" h="5" spacing={1} w="100%">
                        <Text fontSize="xs" color="gray.500">
                            Replying to
                        </Text>
                        <Link fontSize="sm" as="b" >{props.replyTo.author.display_name ?? '@' + props.replyTo.author.name ?? nip19.npubEncode(props.replyTo.author.publicKeyHex)}</Link>
                        {/*<Text as="b" fontSize="xs" w="150px " color="blue.300" noOfLines={1}>{responseUserTags[0]??'*someone*'}</Text>*/}
                    </HStack> : ''}
                {editMode === 'preview' ?
                    <VStack maxH="500px" w="100%" overflowY="scroll">
                        <Text p="5" fontSize={['sm', 'sm', 'md', 'md']} w="100%">
                            {previewNote.content}
                        </Text>
                        <Image fit="scale-down" maxH="500px" src={previewNote.image ?? ''} />
                        {previewNote.embed ?
                            previewNote.embed.kind === 'youtube' ?
                                <iframe title={previewNote.embed.src} height="400px" width="100%" src={previewNote.embed.src} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                                : previewNote.embed.kind === 'mp4' ? <video src={previewNote.embed.src} muted height="300" width="100%" controls /> : '' : ''}
                    </VStack>
                    : <Box w="100%">
                        <Popover placement="bottom-start" isOpen={mentionActive} autoFocus={false} strategy="fixed">
                            <PopoverAnchor>
                                <Textarea ref={textAreaRef} fontSize={['sm', 'sm', 'md', 'md']} p="5" w="100%" h="150px" defaultValue={draftNote.content} onKeyUp={handleKey.bind(this)} onBlur={updateDraftNote.bind(this)} placeholder="What's on your mind? Tell the world some stories..."></Textarea>
                            </PopoverAnchor>
                            <PopoverContent>
                                <PopoverArrow />
                                <Card p={2}>
                                    <FormLabel>Mention user:</FormLabel>
                                    {mentionedUsers.map(mentioned => {
                                        return (<Button onClick={onMentionSelected.bind(this, mentioned)} mb={2}><Avatar src={mentioned.metadata.picture ?? ''} size="xs" mr={2} />{mentioned.metadata.display_name ?? mentioned.metadata.name}</Button>)
                                    })}
                                </Card>
                            </PopoverContent>
                        </Popover>
                    </Box>}
                <Flex w="100%">
                    <HStack w="200px">
                        <Tooltip label="Upload image and embed to your note">
                            <FormLabel htmlFor="noteImage" cursor="pointer" pt="2" pl="2">
                                <FaFileImage />
                            </FormLabel>
                        </Tooltip>
                        <Input id="noteImage" accept="image/*" type="file" hidden onChange={uploadNoteImage.bind(this)} />
                        <EmojiPicker onEmojiClick={addEmoji} />
                    </HStack>
                    <Box flex={1} textAlign="right">
                        <Button variant="solid" size="sm" mr={2} onClick={() => editMode === 'preview' ? setEditMode('edit') : setEditMode('preview')}>{editMode === 'preview' ? 'Edit Note' : 'Preview Note'}</Button>
                        <Button variant="solid" leftIcon={<GoBroadcast />} bgGradient="linear(to-br, brand.purple, brand.green)" size="md" onClick={publish}>Broadcst Note!</Button>
                    </Box>
                </Flex>

            </VStack>
        </Card>)
}
export default Composer;