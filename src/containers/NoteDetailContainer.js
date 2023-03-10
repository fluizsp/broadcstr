import { Box, Container, Spinner, SlideFade, VStack, Fade, Button, useColorModeValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nip19 } from 'nostr-tools';
import NoteList from '../components/NoteList';
import { useParams } from 'react-router';
import Note from '../components/Note';
import { useIntl } from 'react-intl';
import { getNote, listNoteRelateds } from '../services/ContentServices';

const NoteDetailContainer = props => {
    const dispatch = useDispatch()
    const bgGradient = useColorModeValue('linear(to-br, brand.kindsteel1, brand.kindsteel2)', 'linear(to-br, brand.eternalConstance1, brand.eternalConstance2)');
    const params = useParams();
    const intl = useIntl();
    const [mainNote, setMainNote] = useState();
    const [replies, setReplies] = useState([]);
    const [likes, setLikes] = useState([]);
    const [zaps, setZaps] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [limit, setLimit] = useState(25);
    const noteId = nip19.decode(params.id).data;
    const moreResults = () => {
        setLimit(limit + 25);
    }
    const getMainNote = id => {
        getNote(id, result => {
            setMainNote(result);
            setLastUpdate(new Date());
        })
    }
    const getRelateds = id => {
        listNoteRelateds(id, 10000, results => {
            let updatedReplies = replies;
            let updatedLikes = likes;
            let updatedZaps = zaps;
            let updatedReposts = reposts;
            results.replies.forEach(reply => {
                if (updatedReplies.filter(r => r.id === reply.id).length === 0)
                    updatedReplies.push(reply);
            });
            results.likes.forEach(like => {
                if (updatedLikes.filter(l => l.id === like.id).length === 0)
                    updatedLikes.push(like);
            });
            results.zaps.forEach(zap => {
                if (updatedZaps.filter(z => z.id === zap.id).length === 0)
                    updatedZaps.push(zap);
            });
            results.reposts.forEach(repost => {
                if (updatedReposts.filter(r => r.id === repost.id).length === 0)
                    updatedReposts.push(repost);
            })
            setReplies(updatedReplies);
            setLikes(updatedLikes);
            setZaps(updatedZaps);
            setReposts(updatedReposts);
            setLastUpdate(new Date());
        });
    }
    useEffect(() => {
        getMainNote(noteId);
        getRelateds(noteId);
        window.scrollTo(0, 0);
        document.title = `Brodcstr - Note - ${params.id}`;
    }, [noteId]);
    let noteRelateds = { replies: replies, likes: likes, zaps: zaps, reposts: reposts }
    let noteReplies = replies ?? [];
    let sortedNoteReplies = [];
    sortedNoteReplies = [...noteReplies.filter(r => r.eTags.length === 1)]
    sortedNoteReplies.sort((a, b) => { return a.created_at > b.created_at ? -1 : 1 })
    let sortedNoteRepliesIds = sortedNoteReplies.map(r => { return r.id });
    for (let iLevel = 2; iLevel < 10; iLevel++) {
        let moreReplies = noteReplies.filter(r => r.eTags.length === iLevel);
        moreReplies.forEach(r => {
            let index = sortedNoteRepliesIds.indexOf(r.eTags[1])
            if (index > 0) {
                sortedNoteReplies.splice(index + 1, 0, r)
                sortedNoteRepliesIds.splice(index + 1, 0, r.id)
            }
        })
    }
    return (
        <Box minH="100vH" bgGradient={bgGradient}>
            <Box ml={{ md: '100px', lg: '330px' }} >
                <SlideFade in={true} offsetX="1000" offsetY="0" reverse={true} unmountOnExit={true}>
                    <Container maxW='4xl' pt="80px" pb="20px" >
                        {mainNote && mainNote.id ?
                            <Note note={mainNote} relateds={noteRelateds} isThread={true} key={'Note' + mainNote.id} />
                            : null}
                        {noteReplies ?
                            <NoteList notes={sortedNoteReplies.slice(0, limit)} isReply={true} likes={props.likes} /> : null}
                        <VStack>
                            {sortedNoteReplies.length > limit ? <Button onClick={moreResults} >{intl.formatMessage({ id: 'oldersReplies' })}</Button> : null}
                            <Fade in={!mainNote || !mainNote.id || !noteRelateds.replies}>
                                <Spinner size="xl" color="blue.300" />
                            </Fade>
                        </VStack>
                    </Container>
                </SlideFade>
            </Box>
        </Box>

    )
}
export default NoteDetailContainer;