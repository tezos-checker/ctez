import { Box, Grid, Text, useColorModeValue } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { AllOvenDatum } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { getOvenMaxCtez } from '../../utils/ovenUtils';
import { useAppSelector } from '../../redux/store';
import { formatNumber } from '../../utils/numbers';

const truncateText = (text: string | null) => {
  if (text == null) {
    return '';
  }

  const len = text.length;
  return `${text.substr(0, 5)}...${text.substr(len - 5)}`;
};

const AllOvenCard: React.FC<{ oven: AllOvenDatum }> = ({ oven }) => {
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
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

    // TODO: Remove NaN
    const collateralUtilization = formatNumber(
      (toNumber(ctez_outstanding) / maxMintableCtez) * 100,
    ).toFixed(2);

    const items = [
      { label: 'Oven address', value: truncateText(oven.value.address) },
      { label: 'Baker', value: truncateText(oven.key.owner) },
      { label: 'Oven Balance', value: `${formatNumber(tez_balance)} XTZ` },
      { label: 'Outstanding ', value: `${formatNumber(ctez_outstanding)} cTEZ` },
      { label: 'Mintable ', value: `${formatNumber(maxMintableCtez, 6)} cTEZ` },
    ];

    return (
      <>
        {items.map((item) => (
          <Box key={item.label}>
            {item.label === 'Oven address' ? (
              <Text
                color={textcolor}
                onClick={() => navigator.clipboard.writeText(oven.value.address)}
                _hover={{ cursor: 'pointer' }}
                fontWeight="600"
              >
                {item.value}
              </Text>
            ) : (
              <Text color={textcolor} fontWeight="600">
                {item.value}
              </Text>
            )}
            <Text fontWeight="500" color="#B0B7C3" fontSize="xs">
              {item.label}
            </Text>
          </Box>
        ))}
        <Box>
          <ProgressPill value={Number(collateralUtilization ?? 0)} />
          <Text color="#B0B7C3" fontSize="xs">
            Collateral Utilization
          </Text>
        </Box>
      </>
    );
  }, [currentTarget, oven.key.owner, oven.value, textcolor]);

  return (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor={background}
    >
      {renderedItems}
    </Grid>
  );
};

export default AllOvenCard;
