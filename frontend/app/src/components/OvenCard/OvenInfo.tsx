import { Button, Divider, Flex, Stack, Text } from '@chakra-ui/react';
import ProgressPill from './ProgressPill';
import { useOvenStats } from '../../hooks/utilHooks';

const OvenInfo: React.FC = () => {
  const { stats, oven } = useOvenStats();

  return (
    <Stack p={8} spacing={4} backgroundColor="white" borderRadius={16}>
      <Flex w="100%" justifyContent="space-between">
        <Stack>
          <Text fontSize="lg">15.5</Text>
          <Text fontSize="xs">Liquidation Price</Text>
        </Stack>
        <Stack>
          <Text fontSize="lg">15.5</Text>
          <Text fontSize="xs">Collateralization Ratio</Text>
        </Stack>
        <Stack>
          <Text fontSize="lg">15.5</Text>
          <Text fontSize="xs">Current target</Text>
        </Stack>
      </Flex>

      <Divider />

      <Flex w="100%" justifyContent="space-between" alignItems="center">
        <Text>
          <strong>CBaker:</strong>
          {oven?.baker}
        </Text>

        <Button>Change</Button>
      </Flex>

      <div>
        <ProgressPill value={75} />

        <Flex justifyContent="space-between" mx={2}>
          <Text fontSize="xs">Oven Balance - 05</Text>
          <Text fontSize="xs">Outstanding Ctez - 05</Text>
        </Flex>
      </div>

      <div>
        <Text fontWeight="500" mb={2}>
          Currently Anyone can deposit
        </Text>

        <Button w={180} variant="outline">
          Change
        </Button>
      </div>
    </Stack>
  );
};

export default OvenInfo;
