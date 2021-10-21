import { Box, Flex, Icon, Stack, Text, useColorModeValue, VStack, Wrap } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { AllOvenDatum } from '../../interfaces';
import LiquidateOven from '../modals/Liquidate';

interface IProgressPill {
  value: number;
  oven: AllOvenDatum | null;
  type: 'AllOvens' | 'MyOvens' | null;
}

const ProgressPill: React.FC<IProgressPill> = ({ value, oven, type }) => {
  const progressPillBg = useColorModeValue('white', 'darkblue');
  const [liquidateOven, setliquidateOven] = useState(false);
  const SetModalOpen = (isOpen: boolean) => {
    setliquidateOven(isOpen);
  };

  const modals = useMemo(() => {
    return (
      <>
        <LiquidateOven oven={oven} isOpen={liquidateOven} onClose={() => setliquidateOven(false)} />
      </>
    );
  }, [liquidateOven, setliquidateOven]);

  return (
    <div>
      <Stack
        direction="row"
        backgroundColor={value < 100 ? (value > 80 ? '#F6F5E5AA' : '#E5F6EFAA') : '#FFE3E2AA'}
        borderRadius={16}
        px={4}
        pb={value > 100 ? '4' : '0'}
        w="100%"
      >
        <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor={progressPillBg}>
          <Box
            h="100%"
            w={value > 100 ? '100' : `${value}%`}
            borderRadius={4}
            backgroundColor={value < 100 ? (value > 80 ? '#F3DD63' : '#38CB89') : '#CC3936'}
          />
        </Box>
        <Text maxWidth={40}>{value === Infinity ? '0' : value}%</Text>
        {modals}
      </Stack>
      {value > 100 && type === 'AllOvens' && (
        <Text
          color="#CC3936"
          position="relative"
          top="-22px"
          left="22"
          fontSize="12px"
          fontWeight="500"
          h={0}
          onClick={(e) => SetModalOpen(true)}
          _hover={{ cursor: 'pointer' }}
        >
          Liquidate oven
          <Icon ml={1} as={BsArrowRight} />
        </Text>
      )}
    </div>
  );
};

export default ProgressPill;
