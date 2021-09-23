import { Box, Grid, Text } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { AllOvenDatum } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { getOvenMaxCtez } from '../../utils/ovenUtils';
import { useAppSelector } from '../../redux/store';

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
  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);

  const renderedItems = useMemo(() => {
    const toNumber = (value: string | number) => {
      return new BigNumber(value).shiftedBy(-6).toNumber();
    };

    const { tez_balance, ctez_outstanding } = oven.value;

    const { max } = currentTarget
      ? getOvenMaxCtez(toNumber(tez_balance), toNumber(ctez_outstanding), currentTarget)
      : { max: 0 };

    const maxMintableCtez = max < 0 ? 0 : max;

    const items = [
      { label: 'Oven address', value: truncateText(oven.value.address) },
      { label: 'Baker', value: truncateText(oven.key.owner) },
      { label: 'Oven Balance', value: `${formatTokenAmt(tez_balance)} XTZ` },
      { label: 'Outstanding ', value: `${formatTokenAmt(ctez_outstanding)} cTEZ` },
      { label: 'Mintable ', value: `${maxMintableCtez} cTEZ` },
    ];

    return items.map((item) => (
      <Box key={item.label}>
        <Text>{item.value}</Text>
        <Text fontSize="xs">{item.label}</Text>
      </Box>
    ));
  }, [currentTarget, oven]);

  return (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor="white"
    >
      {renderedItems}

      <Box>
        <ProgressPill value={75} />
        <Text fontSize="xs">Collateral Utilization</Text>
      </Box>
    </Grid>
  );
};

export default OvenCard;
