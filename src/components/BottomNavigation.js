import { Box, Button, Center, Grid, GridItem, Hide, Avatar, useColorModeValue } from '@chakra-ui/react'
import { IoIosHome, IoIosSearch } from 'react-icons/io';
import { FaHashtag } from 'react-icons/fa';
import withRouter from '../withRouter';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

const BottomNavigation = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const navigate = useNavigate();
    const isHome = props.router.location.pathname === "/";
    const isSearch = props.router.location.pathname.includes("/search");
    const isOwnProfile = props.router.location.pathname.includes(`/${props.accountInfo.nip05}`);
    if (props.router.location.pathname === "/welcome")
        return null;
    const goHome = () => {
        navigate('/');
    }
    return (
        <Hide above="md" >
            <Box w="100vW" borderTopRadius="2xl" h="50px" bg={uiColor} backdropFilter="auto" backdropBlur="6px"
                bottom="0" left="0" pos="fixed" zIndex="1"
                borderBottom="1px" borderBottomColor={uiColor}>
                <Grid templateColumns="repeat(4,1fr)" gap="5" >
                    <GridItem p="17px" mt="-2" bgGradient={isHome ? "linear(to-br, brand.purple, brand.green)" : ""} borderTopRadius="2xl">
                        <Center>
                            <Button variant="link" size="sm" fontSize="3xl" color={isHome?"blue.900":null} onClick={goHome}><IoIosHome /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4" mt="-2" bgGradient={isSearch ? "linear(to-br, brand.purple, brand.green)" : ""} borderTopRadius="2xl">
                        <Center>
                            <Button onClick={() => { navigate('/search') }} variant="ghost" color={isSearch?"blue.900":null} size="sm" fontSize="2xl"><IoIosSearch /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4">
                        <Center>
                            <Button variant="link" isDisabled size="sm" fontSize="1xl"><FaHashtag /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4" mt="-2" bgGradient={isOwnProfile ? "linear(to-br, brand.purple, brand.green)" : ""} borderTopRadius="2xl">
                        <Center>
                            <Link to={`/${props.accountInfo.nip05??props.account.publicKey}`}>
                                <Avatar src={props.accountInfo.picture ?? ''} name={props.accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" size="sm" />
                            </Link>
                        </Center>
                    </GridItem>
                </Grid>
            </Box>
        </Hide >
    )
}
export default withRouter(BottomNavigation);