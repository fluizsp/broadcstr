import { Box, Button, Center, Grid, GridItem, Hide, Avatar, useColorModeValue } from '@chakra-ui/react'
import { IoIosHome, IoIosSearch } from 'react-icons/io';
import { FaHashtag } from 'react-icons/fa';
import withRouter from '../withRouter';
import { useLocation, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GoSignIn } from 'react-icons/go';

const BottomNavigation = props => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === "/";
    const isSearch = location.pathname.includes("/search");
    const account = useSelector(state => state.user.account);
    const accountInfo = useSelector(state => state.user.accountInfo);
    const isOwnProfile = location.pathname.includes(`/${accountInfo.nip05}`);
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
                            <Button variant="link" size="sm" fontSize="3xl" color={isHome ? "blue.900" : null} onClick={goHome}><IoIosHome /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4" mt="-2" bgGradient={isSearch ? "linear(to-br, brand.purple, brand.green)" : ""} borderTopRadius="2xl">
                        <Center>
                            <Button onClick={() => { navigate('/search') }} variant="ghost" color={isSearch ? "blue.900" : null} size="sm" fontSize="2xl"><IoIosSearch /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4">
                        <Center>
                            <Button variant="link" isDisabled size="sm" fontSize="1xl"><FaHashtag /></Button>
                        </Center>
                    </GridItem>
                    <GridItem p="4" mt="-2" bgGradient={isOwnProfile ? "linear(to-br, brand.purple, brand.green)" : ""} borderTopRadius="2xl">
                        <Center>
                            <Link hidden={!account.publicKey} to={`/${accountInfo.nip05 ?? account.publicKey}`}>
                                <Avatar src={accountInfo.picture ?? ''} name={accountInfo.name ?? 'Visitor'} bg="blue.300" mb="5" size="sm" />
                            </Link>
                            <Button hidden={account.publicKey} onClick={()=>{navigate('/welcome')}} variant="ghost" mt="-1"><GoSignIn /></Button>
                        </Center>
                    </GridItem>
                </Grid>
            </Box>
        </Hide >
    )
}
export default withRouter(BottomNavigation);