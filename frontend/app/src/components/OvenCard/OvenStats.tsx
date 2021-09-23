import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../redux/store';
import { getOvenMaxCtez } from '../../utils/ovenUtils';

const OvenStats: React.FC = () => {
  const { colorMode } = useColorMode();
  const { ovenId } = useParams<{ ovenId: string }>();
  const oven = useAppSelector((state) =>
    state.oven.ovens.find((x) => {
      const ovenIdFromStore = new BigNumber(x.ovenId);
      return ovenId === ovenIdFromStore.toString();
    }),
  );

  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);

  const stats = useMemo(() => {
    if (oven == null) {
      return [];
    }

    const toNumber = (value: BigNumber) => {
      return value.shiftedBy(-6).toNumber();
    };

    const { tez_balance, ctez_outstanding } = oven;
    const { max, remaining } = currentTarget
      ? getOvenMaxCtez(toNumber(tez_balance), toNumber(ctez_outstanding), currentTarget)
      : { max: 0, remaining: 0 };

    const outStandingCtez = new BigNumber(ctez_outstanding).shiftedBy(-6).toNumber() ?? 0;
    const maxMintableCtez = max < 0 ? 0 : max;
    const remainingMintableCtez = remaining < 0 ? 0 : remaining;
    return [
      {
        label: 'Outstanding Ctez',
        value: outStandingCtez,
        percentage: 67,
      },
      {
        label: 'Max Mintable Ctez',
        value: maxMintableCtez,
        percentage: 84,
      },
      {
        label: 'Remaining Ctez',
        value: remainingMintableCtez,
        percentage: 46,
      },
    ];
  }, [currentTarget, oven]);

  return (
    <Stack
      p={8}
      spacing={4}
      backgroundColor={colorMode === 'light' ? 'white' : 'cardbgdark'}
      borderRadius={16}
    >
      <Text color={colorMode === 'light' ? 'text2' : 'white'} fontWeight="600">
        Ctez Stats
      </Text>

      <Divider />

      <Flex justifyContent="space-between">
        {stats.map(({ label, value, percentage }) => (
          <Box key={label} textAlign="center">
            <CircularProgress
              color={percentage > 50 ? (percentage > 80 ? '#38CB89' : '#377DFF') : '#FFAB00'}
              value={percentage}
              size="80px"
              thickness={8}
              capIsRound
            >
              <CircularProgressLabel fontWeight="600" fontSize="lg">
                {percentage}%
              </CircularProgressLabel>
            </CircularProgress>

            <Text fontWeight="600" color={colorMode === 'light' ? 'text2' : 'white'} fontSize="lg">
              {value}
            </Text>
            <Text fontWeight="500" color="#B0B7C3" fontSize="xs">
              {label}
            </Text>
          </Box>
        ))}
      </Flex>
    </Stack>
  );
};

export default OvenStats;
