import { Flex, SkeletonCircle, Text, useMediaQuery } from "@chakra-ui/react";
import React from "react";
import { useTopOvensGraphGql } from "../../api/analytics";
import PiChart from "../../components/graph/pi-chart";
import { useThemeColors } from "../../hooks/utilHooks";

const OvenPiChart: React.FC = () => {
  const [textcolor] = useThemeColors(['homeTxt']);
  const [largerScreen] = useMediaQuery(['(min-width: 900px)']);
  const [background] = useThemeColors([
    'cardbg2',
  ]);
  const { data: dataChart = false } = useTopOvensGraphGql();
  return (<Flex direction='column'
    borderRadius={16}
    backgroundColor={background}
    flexGrow={1}
    flexShrink={1}
    flexBasis={320}
    paddingX='35px'
    paddingY='27px'
    gridGap={6}
    justifyContent='flex-start'
  >

    <Flex justifyContent='space-between'>
      <Text
        color={textcolor}
        fontSize={largerScreen ? '20px' : '16px'}
        lineHeight="29px"
        fontWeight={400}
      >
        Ovens
       </Text>

    </Flex>
    <Flex justifyContent='center' >
      {dataChart ? <PiChart
        data={dataChart}
      /> : <SkeletonCircle size='300' />}
    </Flex>

  </Flex>)
}
export default OvenPiChart;
