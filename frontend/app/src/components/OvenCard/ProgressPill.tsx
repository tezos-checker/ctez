import { Box, Flex, Icon, Stack, Text, useColorModeValue, VStack, Wrap } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { AllOvenDatum } from '../../interfaces';
import LiquidateOven from '../modals/Liquidate';

interface IProgressPill {
  value: number;
  oven: AllOvenDatum | null;
}

const ProgressPill: React.FC<IProgressPill> = ({ value, oven }) => {
  const progressPillBg = useColorModeValue('white', 'darkblue');
  const [liquidateOven, setliquidateOven] = useState(false);

  const SetOpen = (v: boolean) => {
    setliquidateOven(v);
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
        backgroundColor={value < 99 ? (value > 80 ? '#F6F5E5AA' : '#E5F6EFAA') : '#FFE3E2AA'}
        borderRadius={16}
        px={4}
        pb={4}
        w="100%"
      >
        <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor={progressPillBg}>
          <Box
            h="100%"
            w={`${value}%`}
            borderRadius={4}
            backgroundColor={value < 99 ? (value > 80 ? '#F3DD63' : '#38CB89') : '#CC3936'}
          />
        </Box>
        <Text maxWidth={40}>{value}%</Text>
        {modals}
      </Stack>
      {value > 99 && (
        <Text
          color="#CC3936"
          position="relative"
          top="-22px"
          left="22"
          fontSize="12px"
          fontWeight="500"
          onClick={(e) => SetOpen(true)}
          _hover={{ cursor: 'pointer' }}
        >
          Liquidate oven
          <Icon as={BsArrowRight} />
        </Text>
      )}
    </div>
  );
};

export default ProgressPill;
