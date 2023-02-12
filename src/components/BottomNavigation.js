import { Box, Button, Center, Grid, GridItem, Hide, Avatar } from '@chakra-ui/react'
import { IoIosHome, IoIosSearch } from 'react-icons/io';
import { FaHashtag } from 'react-icons/fa';
import { Component } from 'react';
import withRouter from '../withRouter';


class BottomNavigation extends Component {
    render() {
        if (this.props.router.location.pathname === "/welcome")
            return null;
        return (
            <Hide above="md" >
                <Box w="100vW" borderTopRadius="2xl" h="60px" bg="whiteAlpha.800" backdropFilter="auto" backdropBlur="6px"
                    bottom="0" left="0" pos="fixed" zIndex="1"
                    borderBottom="1px" borderBottomColor="white">
                    <Grid templateColumns="repeat(4,1fr)">
                        <GridItem p="3" bgGradient='linear(to-br, brand.purple, brand.green)' borderTopRadius="2xl" backdropFilter="auto" backdropBlur="6px">
                            <Center>
                                <Button variant="link" size="sm" fontSize="4xl" color="blue.900"><IoIosHome /></Button>
                            </Center>
                        </GridItem>
                        <GridItem p="4" borderTopRadius="2xl" borderRight="1px" borderRightColor="white"
                            borderLeft="1px" borderLeftColor="white">
                            <Center>
                                <Button variant="link" size="sm" fontSize="3xl" color="04050E"><IoIosSearch /></Button>
                            </Center>
                        </GridItem>
                        <GridItem p="4" borderTopRadius="2xl" borderRight="1px" borderRightColor="white"
                            borderLeft="1px" borderLeftColor="white">
                            <Center>
                                <Button variant="link" size="sm" fontSize="2xl" color="04050E"><FaHashtag /></Button>
                            </Center>
                        </GridItem>
                        <GridItem p="3" borderTopRadius="2xl" borderRight="1px" borderRightColor="white"
                            borderLeft="1px" borderLeftColor="white">
                            <Center>
                                <Button variant="link" size="sm">
                                    <Avatar src={this.props.accountInfo.picture ?? ''} name={this.props.accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" size="sm" />
                                </Button>
                            </Center>
                        </GridItem>
                    </Grid>
                </Box>
            </Hide >
        )
    }
}

export default withRouter(BottomNavigation);