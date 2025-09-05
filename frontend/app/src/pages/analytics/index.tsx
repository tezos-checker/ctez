import { Box, Center, Flex, Skeleton, Text, useColorMode, useMediaQuery } from '@chakra-ui/react';
import React from 'react';
import { useOvensSummaryGql } from '../../api/analytics';
import { useThemeColors } from '../../hooks/utilHooks';
import { numberToMillionOrBillionFormate } from '../../utils/numberFormate';
import './analytics.css';
import GraphAMMTVL from './graph_amm_tvl';
import GraphAMMVolume from './graph_amm_volume';
import GraphCtez from './graph_ctez';
import GraphDrift from './graph_drift';
import OvenPiChart from './graph_oven_pi';
import GraphTVL from './graph_tvl';
import OvenTable from './ovenTable';
import TransactionTableoven from './transactionsTable';
import TransactionTableAMM from './transactionsTableAmm';


const AnalyticsPage: React.FC = () => {
    const { data: overData = false } = useOvensSummaryGql();

    const [textcolor] = useThemeColors(['homeTxt']);
    const [largerScreen] = useMediaQuery(['(min-width: 900px)']);

    const { colorMode } = useColorMode();
    const GradientText = (text: string | number, isDollor: boolean) => {
        return <b className='gradientcolortext'>
            {isDollor ? '$' : null}
            {text}
        </b>;
    }
    return (
        <Box p={largerScreen ? '55px' : '15px'} pt={largerScreen ? '55px' : '30px'} maxWidth={1200} mx="auto" className={colorMode}>
            <Center maxWidth='759px' margin='0px auto' >
                {overData ? <Text
                    color={textcolor}
                    fontSize={largerScreen ? '40px' : '26px'}
                    lineHeight={largerScreen ? '50px' : '32px'}
                    fontWeight={400}
                    textAlign='center'
                >
                    {GradientText(`${numberToMillionOrBillionFormate(overData.total_debt)} ctez`, false)} collateralized by {GradientText(`${numberToMillionOrBillionFormate(overData.collateral_locked)} tez`, false)} across {GradientText(`${overData.total} `, false)} {GradientText('ovens', false)}

                </Text>
                    : <Skeleton>
                        <Text
                            color={textcolor}
                            fontSize={largerScreen ? '40px' : '26px'}
                            lineHeight="50px"
                            fontWeight={400}
                            textAlign='center'
                        >
                            441.39k ctez collateralized by 568.34k tez across 195 ovens
                </Text>
                    </Skeleton>}
            </Center>
            <div className='section-container'>
                <Text
                    fontSize={largerScreen ? '30px' : '20px'}
                    lineHeight="50px"
                    fontWeight={400}
                    className='gradientcolortext'
                    marginBottom='20px'
                >
                    Protocol
                </Text>
                <Flex direction='row' wrap={largerScreen ? 'nowrap' : 'wrap'} gridGap='10' >
                    <GraphCtez />
                    <GraphDrift />
                </Flex>
            </div>
            <div className='section-container'>
                <Text
                    fontSize={largerScreen ? '30px' : '20px'}
                    lineHeight="50px"
                    fontWeight={400}
                    className='gradientcolortext'
                    marginBottom='20px'
                >
                    Ovens
                </Text>
                <OvenTable />
            </div>

            <div className='section-container'>
                <Flex direction='row' wrap={largerScreen ? 'nowrap' : 'wrap'} gridGap='10' >
                    <GraphTVL />
                    <OvenPiChart />

                </Flex>
            </div>
            <div className='section-container'>
                <TransactionTableoven />
            </div>

            <div className='section-container'>
                <Text
                    fontSize={largerScreen ? '30px' : '20px'}
                    lineHeight="50px"
                    fontWeight={400}
                    className='gradientcolortext'
                    marginBottom='20px'
                >
                    AMM
                </Text>
                <Flex direction='row' wrap={largerScreen ? 'nowrap' : 'wrap'} gridGap='10' >
                    <GraphAMMTVL />
                    <GraphAMMVolume />
                </Flex>
            </div>

            <div className='section-container'>
                <TransactionTableAMM />
            </div>


        </Box>
    )
}
export default AnalyticsPage;
