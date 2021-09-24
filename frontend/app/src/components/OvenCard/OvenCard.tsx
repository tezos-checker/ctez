import { Box, Grid, Text, useColorMode } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { AllOvenDatum } from '../../interfaces';
import ProgressPill from './ProgressPill';

const truncateText = (text: string | null) => {
  if (text == null) {
    return '';
  }

  const len = text.length;
  return `${text.substr(0, 5)}...${text.substr(len - 5)}`;
};

const formatTokenAmt = (value: string | number) => {
  return new BigNumber(value).shiftedBy(-6).toNumber() ?? 0;
};

const OvenCard: React.FC<{ oven: AllOvenDatum }> = ({ oven }) => {
  const { colorMode } = useColorMode();

  const renderItems = () => {
    const items = [
      { label: 'Oven address', value: truncateText(oven.value.address) },
      { label: 'Baker', value: truncateText(oven.key.owner) },
      { label: 'Oven Balance', value: `${formatTokenAmt(oven.value.tez_balance)} XTZ` },
      { label: 'Outstanding ', value: `${formatTokenAmt(oven.value.ctez_outstanding)} cTEZ` },
      { label: 'Mintable ', value: `500.41 cTEZ` },
    ];

    return items.map((item) => (
      <Box key={item.label}>
        <Text color={colorMode === 'light' ? 'text2' : 'white'} fontWeight="600">
          {item.value}
        </Text>
        <Text fontWeight="500" color="#B0B7C3" fontSize="xs">
          {item.label}
        </Text>
      </Box>
    ));
  };

  return (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor={colorMode === 'light' ? 'white' : 'cardbgdark'}
    >
      {renderItems()}

      <Box>
        <ProgressPill value={75} />
        <Text color="#B0B7C3" fontSize="xs">
          Collateral Utilization
        </Text>
      </Box>
    </Grid>
  );
};

export default OvenCard;
