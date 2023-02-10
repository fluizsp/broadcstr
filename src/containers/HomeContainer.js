import { Center, Box, Button, Container, Grid, GridItem, Spinner, Show, SlideFade } from '@chakra-ui/react'
import { HiPlusCircle } from 'react-icons/hi';
import { Component } from 'react';
import { connect } from 'react-redux';

import { loadNotes } from '../actions/relay';
import Note from '../components/Note';

import LazyLoad from 'react-lazyload';
import { Navigate } from 'react-router';
import withRouter from '../withRouter';

const mapDispatchToProps = (dispatch) => {
    return {
        loadNotes: (feedType, component) => {
            component.state.feedType = 'following';
            component.state.isLoading = true;
            dispatch(loadNotes());
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    let last = new Date();
    return {
        notes: state.relay.notes,
        relayLoaded: state.relay.loaded,
        last_time: last,
        loggedIn: state.user.loggedIn,
        account: state.user.account
    }
}

class HomeContainer extends Component {

    constructor(props) {

        super(props);
        this.state = {
            isLoading: false,
            feedType: ''
        }
    }
    componentDidUpdate() {

    }
    componentDidMount() {
        /*if (this.state.feedType === '')
            this.props.loadNotes.bind(this, 'following', this)();*/
    }
    render() {
        let notes = this.props.notes;
        let feedType = this.state.feedType;
        return (
            <Box minH="100vH" bgGradient='linear(to-br, brand.kindsteel1, brand.kindsteel2)'>
                <Box ml={{ md: '100px', lg: '330px' }} >
                    {!this.props.loggedIn?<Navigate to="/welcome" />:''}
                    <SlideFade in={true}>
                        <Container maxW='4xl' pt="80px" pb="20px" >
                            <Grid templateColumns='repeat(12, 1fr)' gap="3" mb="5">
                                <Show above="md">
                                    <GridItem colSpan={7}>
                                        <Box bg="whiteAlpha.700" h="54px" p="1">
                                            <Center>
                                                <Button leftIcon={<HiPlusCircle />} pl="10" pr="10" variant="ghost" size="lg" fontSize="md" color="gray.400">What's on your mind?</Button>
                                            </Center>
                                        </Box>
                                    </GridItem>
                                </Show>
                                <GridItem colSpan={[12, 12, 5]}>
                                    <Box bg="whiteAlpha.700" h="54px" p="4">
                                        <Center>
                                            <Button size="sm" variant="link" pr="5">Trending</Button>
                                            <Button size="sm" variant="link" pr="5" color={feedType === "following" ? "blue.300" : ''} onClick={this.props.loadNotes.bind(this, 'following', this)}>Following</Button>
                                        </Center>
                                    </Box>
                                </GridItem>
                            </Grid>
                            <Center display={this.props.isLoading ? 'flex' : 'none'}>
                                <Spinner size="xl" color="blue.300" />
                            </Center>
                            <LazyLoad height={200} overflow={true}>
                                {
                                    Object.keys(notes).map((key) => {
                                        return (<Note note={notes[key]} key={'Note' + key} />);
                                    })
                                }
                            </LazyLoad>
                        </Container>
                    </SlideFade>
                </Box>
            </Box>

        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(HomeContainer));