import { Box, VStack, Card, Image, Heading, HStack, Text, Link, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { format } from 'date-fns';
import { FaAward } from 'react-icons/fa';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { VIEW_BADGE } from '../actions/relay';

const Badge = props => {
    const dispatch = useDispatch();
    const intl=useIntl();
    const uiColor = useColorModeValue('brand.lightUi', 'brand.darkUi');
    const goldGradient = 'linear(to-br, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, #5d4a1f 62.5%, #5d4a1f 100%)';
    const badgeBaseColor = useColorModeValue('brand.blessing1', 'brand.eternalConstance1')
    const badgeBaseGradient = 'linear(to-br, #434343 0%, black 100%)';
    const badgeGradient = useColorModeValue('linear(to-br, brand.eternalConstance1, brand.eternalConstance2)', 'linear(to-br, brand.blessing1, brand.blessing2)');;
    const borderSize = 'full|lg'.includes(props.size) ? '320px' : props.size === 'md' ? '210px' : props.size === 'sm' ? '90px' : '45px';
    const borderPadding = 'full|lg'.includes(props.size) ? '20px' : props.size === 'md' ? '10px' : props.size === 'sm' ? '5px' : '2px';
    const imgSize = 'full|lg'.includes(props.size) ? '300px' : props.size === 'md' ? '200px' : props.size === 'sm' ? '80px' : '40px';
    const borderRadius = 'full|lg|md'.includes(props.size) ? 20 : 10;
    const badgeAuthorMetadata = useSelector(state => state.user.usersMetadata[props.badgeInfo.badge.pubkey]);
    const titleBarSize = 'full|lg'.includes(props.size) ? '340px' : props.size === 'md' ? '240px' : '110px';
    const titleSize = 'full|lg'.includes(props.size) ? 'md' : props.size === 'md' ? 'sm' : 'xs';
    const badgeName = props.badgeInfo && props.badgeInfo.badge ? props.badgeInfo.badge.tags.find(([t, v]) => t === 'name')[1] : '';
    const badgeDescription = props.badgeInfo && props.badgeInfo.badge ? props.badgeInfo.badge.tags.find(([t, v]) => t === 'description')[1] : '';
    const badgeImg = props.badgeInfo && props.badgeInfo.badge ? props.badgeInfo.badge.tags.find(([t, v]) => t === 'image')[1] : '';
    const badgeThumb = props.badgeInfo && props.badgeInfo.badge ? props.badgeInfo.badge.tags.find(([t, v]) => t === 'thumb')[1] : '';
    const awardedToN = props.badgeInfo && props.badgeInfo.award ? props.badgeInfo.award.tags.filter(([t, v]) => t === 'p').length : '';
    const created=props.badgeInfo && props.badgeInfo.badge? new Date(props.badgeInfo.badge.created_at*1000):'';
    console.log(created);
    const openBadge = () => {
        dispatch({ type: VIEW_BADGE, data: props.badgeInfo });
    }
    return (
        <Box cursor={props.size !== 'full' ? 'pointer' : ''} onClick={openBadge}>
            <VStack spacing={0}>
                {'full|lg|md'.includes(props.size) ?
                    <Box bgGradient={badgeBaseGradient} p={borderPadding} borderRadius={5} borderBottomRadius={0} w={titleBarSize}>
                        <Box bgGradient={goldGradient} p={borderPadding} borderRadius={5} textAlign="center" mt="0" color="white">
                            <Heading size={titleSize}>{badgeName}</Heading>
                        </Box>
                    </Box> : ''}
                <Tooltip label={badgeName}>
                    <Card borderBottomRadius={borderRadius} borderTopRadius={!'xs|sm'.includes(props.size) ? 0 : 10} mt={5} p={borderPadding} pt={!'xs|sm'.includes(props.size) ? 0 : ''} bgGradient={badgeGradient} >
                        <VStack w="100%">
                            <Image borderRadius={10} borderTopRadius={!'xs|sm'.includes(props.size) ? 0 : 10} w={imgSize} h={imgSize} src={'xs|sm'.includes(props.size) && badgeThumb ? badgeThumb : badgeImg} />
                        </VStack>
                    </Card>
                </Tooltip>
                {''.includes(props.size) ?
                    <Card borderBottomRadius={20} borderTopRadius={0} mb={10} bgGradient={badgeGradient} pl={5} pr={5}>
                        <HStack spacing color="brand.eternalConstance1"><FaAward /><Text size="md" p={3}>@sophiaw1926</Text> <FaAward /></HStack>
                    </Card> : null}

            </VStack>
            {props.size === 'full' ?
                <Box p={10}>
                    <VStack spacing={2}>
                        <Text textAlign="center" p={2}>{badgeDescription}</Text>
                        <HStack w="100%"><Text as="b">{intl.formatMessage({ id: 'created' })}:</Text><Text>{format(created,'yyyy-MM-dd')}</Text></HStack>
                        <HStack w="100%"><Text as="b">{intl.formatMessage({ id: 'by' })}:</Text><Link as="DomLink" to='/'>{badgeAuthorMetadata.nip05}</Link></HStack>
                        {/*<HStack w="100%"><Text as="b">To:</Text><Link as="DomLink">@sophiaw1926</Link></HStack>*/}
                    </VStack>
                </Box> : null}
        </Box>
    )
}

export default Badge;