import { Box, Image, Button, Tooltip, Grid, GridItem, Hide } from '@chakra-ui/react'
import { IoMdAddCircleOutline, IoMdNotifications, } from 'react-icons/io';
import { BiMessage } from 'react-icons/bi';

import logo from '../logo_h.svg';
import { Component } from 'react';

class TopBar extends Component {

    render() {
        return (
            <Box w="100vW" borderBottomRadius={['xl','xl','0']} ml={['0', '0', '100px', '330px']} h="60px" bg="whiteAlpha.700" backdropFilter="auto" backdropBlur="6px" 
                top="0" left="0" pos="fixed" zIndex="1" pr={['0', '0', '110px', '340px']}
                borderBottom="1px" borderBottomColor="white">
                <Grid templateColumns="repeat(12,1fr)">
                    <GridItem colSpan={6} p="5" >
                        <Hide above="md" >
                            <Image src={logo} w="100px" />
                        </Hide>
                    </GridItem>
                    <GridItem p="4" colSpan={6} textAlign="right">
                        <Tooltip label="What's on your mind?" fontSize='md'>
                            <Button variant="ghost" size="sm" fontSize="2xl" ><IoMdAddCircleOutline /></Button>
                        </Tooltip>
                        <Tooltip label="Notifications" fontSize='md'>
                            <Button variant="ghost" size="sm" fontSize="2xl" ><IoMdNotifications /></Button>
                        </Tooltip>
                        <Tooltip label="Messages" fontSize='md'>
                            <Button variant="ghost" size="sm" fontSize="2xl" ><BiMessage /></Button>
                        </Tooltip>
                    </GridItem>
                </Grid>
            </Box>
        )
    }
}

export default TopBar;