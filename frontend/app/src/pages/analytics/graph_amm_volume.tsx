import { Button, ButtonGroup, Flex, Skeleton, SkeletonText, Text, useMediaQuery } from "@chakra-ui/react";
import React, { useMemo, useState } from "react";
import { format } from 'date-fns/fp';
import { useTradeVolumeCurrentPointGql, useTradeVolumeGql } from "../../api/analytics";
import { useThemeColors } from "../../hooks/utilHooks";
import { numberToMillionOrBillionFormate } from "../../utils/numberFormate";
import { ChartPure } from "./chart";

const GraphAMMVolume: React.FC = () => {
    const [textcolor] = useThemeColors(['homeTxt']);
    const [largerScreen] = useMediaQuery(['(min-width: 900px)']);
    const [background] = useThemeColors([
        'cardbg2',
    ]);
    const { data: historicalData1d = false } = useTradeVolumeGql('day');
    const { data: currentPoint1d = false } = useTradeVolumeCurrentPointGql('day');
    const { data: historicalData30d = false } = useTradeVolumeGql('month');
    const { data: currentPoint30d = false } = useTradeVolumeCurrentPointGql('month');

    const [value, setValue] = useState<number | undefined>();
    const [time, setTime] = useState<number | undefined>();
    const [activeTab, setActiveTab] = useState('1d');
    const historicalData = activeTab === '1m' ? historicalData30d : historicalData1d;
    const currentPoint = activeTab === '1m' ? currentPoint30d : currentPoint1d;
    const chartData = useMemo(
        () => historicalData && currentPoint ? [...historicalData, currentPoint] : historicalData,
        [historicalData, currentPoint, activeTab]
    );
    // graph options
    const dateFormat = useMemo(() => format('MMM d, yyyy'), []);
    const dateFormat2 = useMemo(() => format('MMM, yyyy'), []);

    const option: React.ComponentProps<typeof ChartPure>['option'] = {
        dataset: [{
            dimensions: [
                { name: 'timestamp', displayName: '' },
                { name: 'volume_usd', displayName: 'Volume  ' },
            ],
            source: chartData || []
        }],
        tooltip: {
            trigger: 'axis',
            valueFormatter: (v: unknown) => `$${numberToMillionOrBillionFormate(v)}`
        },
        xAxis: {
            type: 'time',
        },
        yAxis: {
            type: 'value',
            scale: true,
        },
        series: [{
            type: 'bar',
            color: '#0F62FF',
            datasetIndex: 0,
        }]
    };

    const lastValue = chartData && chartData[chartData.length - 1]?.volume_usd;

    return (<Flex direction='column'
        borderRadius={16}
        backgroundColor={background}
        flexGrow={1}
        flexShrink={1}
        flexBasis={320}
        paddingX={largerScreen ? '35px' : '19px'}
        paddingY={largerScreen ? '27px' : '24px'}
        gridGap={4}
    >

        <Flex justifyContent='space-between'>
            <div>
                <Text
                    color={textcolor}
                    fontSize={largerScreen ? '14px' : '14px'}
                    lineHeight="29px"
                    fontWeight={400}
                >
                    Volume
            </Text>
                <Flex flexDirection='column'>
                    <Text
                        color={textcolor}
                        fontSize={largerScreen ? '32px' : '18px'}
                        lineHeight="29px"
                        fontWeight={600}
                    >
                        {(lastValue && !value) ? `$${numberToMillionOrBillionFormate(lastValue)}` : value ? `$${numberToMillionOrBillionFormate(value)}` : <SkeletonText pr={6} noOfLines={1} spacing="1" />}
                    </Text>
                    {time ? <Text fontSize='12px' >{activeTab === '1m' ? dateFormat(time) : dateFormat2(time)}</Text> : <Text fontSize='12px' opacity={0}>Time</Text>}
                </Flex>
            </div>
            <ButtonGroup variant='ghost' gridGap={2} textColor={textcolor} fontSize='12px' spacing='-1'>
                <Button fontSize='12px' className={activeTab === '1d' ? "btnactive" : ''} textDecoration='underline' onClick={() => setActiveTab('1d')} >1D</Button>
                <Button fontSize='12px' className={activeTab === '1m' ? "btnactive" : ''} textDecoration='underline' onClick={() => setActiveTab('1m')}>1M</Button>
            </ButtonGroup>

        </Flex>
        {chartData
            ? <ChartPure
                option={option}
                showZoom
                style={{ height: 300 }} />
            : <Skeleton height='300px' minWidth='20px' />}
    </Flex>)
}
export default GraphAMMVolume;
