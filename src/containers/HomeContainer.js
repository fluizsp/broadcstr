import { Center, Box, Button, Container, Grid, GridItem, Link, Spinner, Show } from '@chakra-ui/react'
import { HiPlusCircle } from 'react-icons/hi';
import { Component } from 'react';
import { connect } from 'react-redux';
import MenuBar from '../components/MenuBar';
import { loadNotes, loadRelay } from '../actions/relay';
import Note from '../components/Note';

const mapDispatchToProps = (dispatch) => {
    return {
        loadRelay: () => {
            dispatch(loadRelay());
        },
        loadNotes: () => {
            dispatch(loadNotes());
        }
    }
};

const mapStateToProps = (state, ownProps) => {
    let last= new Date();
    return {
        notes: state.relay.notes,
        last_time:last
    }
}


class HomeContainer extends Component {
    componentDidMount() {
        this.props.loadRelay();
    }

    render() {
        let notes=this.props.notes;
        return (
            <Box bgGradient='linear(to-br, brand.kindsteel1, brand.kindsteel2)' minH="100vH">
                <MenuBar /> 
                <Box ml={{ md: '100px', lg: '330px' }}>
                    <Container maxW='4xl' pt="20px" pb="20px">
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
                                        <Link pl="2" fontSize="sm" >Trending</Link>
                                        <Link pl="2" fontSize="sm">Following</Link>
                                        <Link as="b" pl="2" fontSize="sm" color="blue.300" onClick={this.props.loadNotes.bind(this)}>Global</Link>
                                    </Center>
                                </Box>
                            </GridItem>
                        </Grid>
                        <Center>
                            <Spinner size="xl" color="blue.300" />
                        </Center> 
                        {notes.map((note, i) => { 
                            if(i<50)
                                return (<Note note={note} /> );
                        })}
                    </Container>
                </Box>
            </Box> 
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(HomeContainer);