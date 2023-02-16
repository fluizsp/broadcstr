import { Box, Button, Center, Grid, GridItem, Hide, Avatar, useColorModeValue } from '@chakra-ui/react'
import { IoIosHome, IoIosSearch } from 'react-icons/io';
import { FaHashtag } from 'react-icons/fa';
import withRouter from '../withRouter';

const BottomNavigation = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    if (props.router.location.pathname === "/welcome")
        return null;
    const goHome = () => {
        window.location = '/'
    }
    return (
        <Hide above="md" >
            <Box w="100vW" borderTopRadius="2xl" h="60px" bg={uiColor} backdropFilter="auto" backdropBlur="6px"
                bottom="0" left="0" pos="fixed" zIndex="1"
                borderBottom="1px" borderBottomColor={uiColor}>
                <Grid templateColumns="repeat(4,1fr)">
                    <GridItem p="3" bgGradient='linear(to-br, brand.purple, brand.green)' borderTopRadius="2xl" backdropFilter="auto" backdropBlur="6px">
                        <Center>
                            <Button variant="link" size="sm" fontSize="4xl" color="blue.900" onClick={goHome}><IoIosHome /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4" borderTopRadius="2xl" borderRight="1px" borderRightColor={uiColor}
                        borderLeft="1px" borderLeftColor={uiColor}>
                        <Center>
                            <Button variant="link" size="sm" fontSize="3xl" color="04050E"><IoIosSearch /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4" borderTopRadius="2xl" borderRight="1px" borderRightColor={uiColor}
                        borderLeft="1px" borderLeftColor={uiColor}>
                        <Center>
                            <Button variant="link" size="sm" fontSize="2xl"><FaHashtag /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="3" borderTopRadius="2xl" borderRight="1px" borderRightColor={uiColor}
                        borderLeft="1px" borderLeftColor={uiColor}>
                        <Center>
                            <Button variant="link" size="sm">
                                <Avatar src={props.accountInfo.picture ?? ''} name={props.accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" size="sm" />
                            </Button>
                        </Center>
                    </GridItem>
                </Grid>
            </Box>
        </Hide >
    )
}
export default withRouter(BottomNavigation);