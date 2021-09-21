import { Divider, Flex, Stack, Text } from '@chakra-ui/react';
import ProgressPill from './ProgressPill';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';

const OvenInfo: React.FC = () => {
  const { stats, oven } = useOvenStats();

  return (
    <Stack p={8} spacing={4} backgroundColor="white" borderRadius={16}>
      <Flex w="100%" justifyContent="space-between">
        <Stack>
          <Text color="4E5D78" fontWeight="600" fontSize="lg">
            15.5
          </Text>
          <Text color="#B0B7C3" fontSize="xs">
            Liquidation Price
          </Text>
        </Stack>
        <Stack>
          <Text color="4E5D78" fontWeight="600" fontSize="lg">
            15.5
          </Text>
          <Text color="#B0B7C3" fontSize="xs">
            Collateralization Ratio
          </Text>
        </Stack>
        <Stack>
          <Text color="4E5D78" fontWeight="600" fontSize="lg">
            15.5
          </Text>
          <Text color="#B0B7C3" fontSize="xs">
            Current target
          </Text>
        </Stack>
      </Flex>

      <Divider />

      <Flex w="100%" justifyContent="space-between" alignItems="center">
        <Text fontSize="12px" pr="10">
          <strong>CBaker:</strong>
          <span>{oven?.baker}</span>
        </Text>

        <Button variant="outline" w="100%">
          Change
        </Button>
      </Flex>

      <div>
        <ProgressPill value={75} />

        <Flex justifyContent="space-between" mx={2}>
          <Text color="#B0B7C3" fontSize="xs">
            Oven Balance - 05
          </Text>
          <Text color="#B0B7C3" fontSize="xs">
            Outstanding Ctez - 05
          </Text>
        </Flex>
      </div>

      <div>
        <Text color="#4E5D78" fontWeight="600" mb={2}>
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
