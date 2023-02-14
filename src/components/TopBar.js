import { Box, Image, Button, Tooltip, Grid, GridItem, Hide } from '@chakra-ui/react'
import { IoMdAddCircleOutline, IoMdNotifications, IoMdArrowBack } from 'react-icons/io';
import { BiMessage } from 'react-icons/bi';
import { Link as DomLink, useLocation, useNavigate } from 'react-router-dom'
import { useColorModeValue } from '@chakra-ui/react';


import logo from '../logo_h.svg';
import logoDark from '../logo_h_dark.svg';

const TopBar = (props) => {
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const logoSelector = useColorModeValue(logo, logoDark);
    const location = useLocation();
    const navigate = useNavigate();
    if (location.pathname === "/welcome")
        return null;
    return (
        <Box w="100vW" borderBottomRadius={['xl', 'xl', '0']} ml={['0', '0', '100px', '330px']} h="60px" bg={uiColor} backdropFilter="auto" backdropBlur="6px"
            top="0" left="0" pos="fixed" zIndex="1" pr={['0', '0', '110px', '340px']}
            borderBottom="1px" borderBottomColor={uiColor}>
            <Grid templateColumns="repeat(12,1fr)">
                <GridItem colSpan={6} p="3.5" >
                    {props.backLabel ?
                        <Button onClick={() => { navigate(-1) }} mt="-1" variant="ghost" leftIcon={<IoMdArrowBack />}>{props.backLabel}</Button>
                        :
                        <Hide above="md" >
                            <Image src={logoSelector} w="130px" />
                        </Hide>}

                </GridItem>
                <GridItem p="4" colSpan={6} textAlign="right">
                    <Tooltip label="What's on your mind?" fontSize='md'>
                        <Button variant="ghost" size="sm" fontSize="2xl" ><IoMdAddCircleOutline /></Button>
                    </Tooltip>
                    <Tooltip label="Notifications" fontSize='md'>
                        <Button variant="ghost" size="sm" fontSize="2xl" ><IoMdNotifications /></Button>
                    </Tooltip>
                    <Tooltip label="Messages (not available yet)" fontSize='md'>
                        <Button variant="ghost" size="sm" isDisabled={true} fontSize="2xl" ><BiMessage /></Button>
                    </Tooltip>
                </GridItem>
            </Grid>
        </Box>
    )
}

export default TopBar;