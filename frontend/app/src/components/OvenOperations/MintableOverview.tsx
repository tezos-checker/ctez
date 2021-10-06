import { Divider, Flex, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';
import Burn from '../modals/Burn';
import Mint from '../modals/Mint';

const MintableOverview: React.FC = () => {
  const { stats, oven } = useOvenStats();
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const [mintOpen, setMintOpen] = useState<boolean>(false);
  const [burnOpen, setBurnOpen] = useState<boolean>(false);

  const modals = useMemo(() => {
    if (!oven) {
      return null;
    }
    if (mintOpen) {
      return (
        <>
          <Mint isOpen={mintOpen} onClose={() => setMintOpen(false)} />
        </>
      );
    }
    if (burnOpen) {
      return (
        <>
          <Burn isOpen={burnOpen} onClose={() => setBurnOpen(false)} />
        </>
      );
    }
  }, [mintOpen, setMintOpen, burnOpen, setBurnOpen]);

  return (
    <>
      <Stack p={8} spacing={4} backgroundColor={background} borderRadius={16}>
        <Text color={textcolor} fontWeight="700">
          Mintable Overview
        </Text>
        <Divider />
        <Flex w="100%" justifyContent="space-between">
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              5 tez
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Outstanding
            </Text>
          </Stack>
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              5 tez
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Maximum Mintable
            </Text>
          </Stack>
          <Stack>
            <Text color="4E5D78" fontWeight="600" fontSize="lg">
              5 tez
            </Text>
            <Text color="#B0B7C3" fontSize="xs">
              Remaining Mintable
            </Text>
          </Stack>
        </Flex>
        <HStack w="100%" justifyContent="space-between" spacing="24px">
          <Button variant="outline" w="95%" onClick={() => setMintOpen(true)}>
            Mint
          </Button>
          <Button variant="outline" w="100%" onClick={() => setBurnOpen(true)}>
            Burn
          </Button>
        </HStack>
      </Stack>
      {modals}
    </>
  );
};

export default MintableOverview;
