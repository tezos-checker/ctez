import {
  Center,
  Divider,
  Flex,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useMemo, useState } from 'react';
import { useOvenStats, useThemeColors } from '../../hooks/utilHooks';
import Button from '../button/Button';
import Burn from '../modals/Burn';
import Mint from '../modals/Mint';
import { AllOvenDatum } from '../../interfaces';
import data from '../../assets/data/info.json';
import { formatNumberStandard } from '../../utils/numbers';

const MintableOverview: React.FC<{ oven: AllOvenDatum | undefined; isImported: boolean }> = ({
  oven,
  isImported,
}) => {
  const { stats } = useOvenStats(oven);
  const [mintOpen, setMintOpen] = useState<boolean>(false);
  const [burnOpen, setBurnOpen] = useState<boolean>(false);
  const [background, textcolor, cardbg, text4] = useThemeColors([
    'cardbg',
    'textColor',
    'tooltipbg1',
    'text4',
  ]);

  const showInfoOutstanding = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'outstanding')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4]);
  const showInfoMaxMintable = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'mintable')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4]);
  const showInfoRemainingMintable = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            {data.find((item) => item.topic === 'remaining mintable')?.content}
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4]);

  const modals = useMemo(() => {
    if (!oven) {
      return null;
    }
    return (
      <>
        <Mint oven={oven} isOpen={mintOpen} onClose={() => setMintOpen(false)} />
        <Burn oven={oven} isOpen={burnOpen} onClose={() => setBurnOpen(false)} />
      </>
    );
  }, [oven, mintOpen, setMintOpen, burnOpen, setBurnOpen]);

  return (
    <>
      <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
        <Text color={textcolor} fontWeight="700">
          Mintable Overview
        </Text>

        <Divider />

        <Flex w="100%" justifyContent="space-between">
          <Stack>
            <Skeleton isLoaded={stats?.outStandingCtez != null}>
              <Text color="4E5D78" fontWeight="600" fontSize="lg">
                {formatNumberStandard(stats?.outStandingCtez)} ctez
              </Text>
            </Skeleton>

            <Text color={text4} fontSize="xs">
              Outstanding
              <Tooltip
                label={showInfoOutstanding}
                placement="right"
                borderRadius={14}
                backgroundColor={cardbg}
              >
                <span>
                  <Icon opacity="0.3" fontSize="md" color={text4} as={MdInfo} m={1} mb={1} />
                </span>
              </Tooltip>
            </Text>
          </Stack>

          <Center height="50px">
            <Divider orientation="vertical" />
          </Center>

          <Stack>
            <Skeleton isLoaded={stats?.maxMintableCtez != null}>
              <Text color="4E5D78" fontWeight="600" fontSize="lg">
                {formatNumberStandard(stats?.maxMintableCtez)} ctez
              </Text>
            </Skeleton>

            <Text color={text4} fontSize="xs">
              Maximum Mintable
              <Tooltip
                label={showInfoMaxMintable}
                placement="right"
                borderRadius={14}
                backgroundColor={cardbg}
              >
                <span>
                  <Icon opacity="0.3" fontSize="md" color={text4} as={MdInfo} m={1} mb={1} />
                </span>
              </Tooltip>
            </Text>
          </Stack>

          <Center height="50px">
            <Divider orientation="vertical" />
          </Center>

          <Stack>
            <Skeleton isLoaded={stats?.remainingMintableCtez != null}>
              <Text color="4E5D78" fontWeight="600" fontSize="lg">
                {formatNumberStandard(stats?.remainingMintableCtez)} ctez
              </Text>
            </Skeleton>

            <Text color={text4} fontSize="xs">
              Remaining Mintable
              <Tooltip
                label={showInfoRemainingMintable}
                placement="right"
                borderRadius={14}
                backgroundColor={cardbg}
              >
                <span>
                  <Icon opacity="0.3" fontSize="md" color={text4} as={MdInfo} m={1} mb={1} />
                </span>
              </Tooltip>
            </Text>
          </Stack>
        </Flex>

        {!isImported && (
          <HStack w="100%" justifyContent="space-between" spacing="24px">
            <Button variant="outline" w="95%" onClick={() => setMintOpen(true)}>
              Mint
            </Button>

            <Button variant="outline" w="100%" onClick={() => setBurnOpen(true)}>
              Burn
            </Button>
          </HStack>
        )}
      </Stack>

      {modals}
    </>
  );
};

export default MintableOverview;
