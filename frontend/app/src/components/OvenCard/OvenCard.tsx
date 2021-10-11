import { Box, Grid, Text, useColorModeValue } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AllOvenDatum, Oven } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { getOvenMaxCtez } from '../../utils/ovenUtils';
import { useAppSelector } from '../../redux/store';
import { formatNumber } from '../../utils/numbers';

type TOvenCardProps =
  | {
      type: 'allOvens';
      oven: AllOvenDatum;
    }
  | {
      type: 'myOvens';
      oven: Oven;
    };

const truncateText = (text: string | null) => {
  if (text == null) {
    return '';
  }

  const len = text.length;
  return `${text.substr(0, 5)}...${text.substr(len - 5)}`;
};

const OvenCard: React.FC<TOvenCardProps> = ({ type, oven }) => {
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);

  const renderedItems = useMemo(() => {
    const toNumber = (value: string | number) => {
      return new BigNumber(value).shiftedBy(-6).toNumber();
    };

    const { address, baker, tezBalance, ctezOutstanding } = (() => {
      if (type === 'allOvens' && 'value' in oven) {
        return {
          address: oven.value.address,
          baker: oven.key.owner,
          tezBalance: oven.value.tez_balance,
          ctezOutstanding: oven.value.ctez_outstanding,
        };
      }

      if (type === 'myOvens' && 'tez_balance' in oven) {
        return {
          address: oven.address,
          baker: oven.baker,
          tezBalance: oven.tez_balance,
          ctezOutstanding: oven.ctez_outstanding,
        };
      }

      return { address: '', baker: '', tezBalance: 0, ctezOutstanding: 0 };
    })();

    const { max } = currentTarget
      ? getOvenMaxCtez(toNumber(tezBalance), toNumber(ctezOutstanding), currentTarget)
      : { max: 0 };

    const maxMintableCtez = max < 0 ? 0 : max;

    let collateralUtilization = formatNumber(
      (toNumber(ctezOutstanding) / maxMintableCtez) * 100,
    ).toFixed(1);

    if (collateralUtilization === 'NaN') {
      collateralUtilization = '0';
    }

    const items = [
      { label: 'Oven address', value: truncateText(address) },
      { label: 'Baker', value: truncateText(baker) },
      { label: 'Oven Balance', value: `${formatNumber(tezBalance)} XTZ` },
      { label: 'Outstanding ', value: `${formatNumber(ctezOutstanding)} cTEZ` },
      { label: 'Mintable ', value: `${formatNumber(maxMintableCtez, 6)} cTEZ` },
    ];

    return (
      <>
        {items.map((item) => (
          <Box key={item.label}>
            {item.label === 'Oven address' ? (
              <Text
                color={textcolor}
                onClick={() => navigator.clipboard.writeText(address)}
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
  }, [currentTarget, oven, textcolor, type]);

  const content = (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor={background}
      _hover={
        type === 'myOvens'
          ? { boxShadow: '0 23px 66px 4px rgba(176, 183, 195, 0.25)', cursor: 'pointer' }
          : {}
      }
    >
      {renderedItems}
    </Grid>
  );

  if (type === 'myOvens' && 'ovenId' in oven) {
    return <Link to={`/myovens/${oven.ovenId}`}>{content}</Link>;
  }

  return content;
};

export default OvenCard;
