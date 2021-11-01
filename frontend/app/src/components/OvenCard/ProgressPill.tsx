import { Box, Flex, Icon, Stack, Text, Tooltip } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsArrowRight } from 'react-icons/bs';
import { MdInfo } from 'react-icons/md';
import { useThemeColors } from '../../hooks/utilHooks';
import { AllOvenDatum } from '../../interfaces';
import LiquidateOven from '../modals/Liquidate';

interface IProgressPill {
  value: number;
  oven: AllOvenDatum | null;
  type: 'AllOvens' | 'MyOvens' | null;
  warning: boolean | null;
}

const ProgressPill: React.FC<IProgressPill> = ({ value, oven, type, warning }) => {
  const { t } = useTranslation(['common']);
  const [liquidateOven, setliquidateOven] = useState(false);
  const [progressPillBg, cardbg, text4, red, orange] = useThemeColors([
    'progressPillBg',
    'tooltipbg1',
    'text4',
    'red',
    'orange',
  ]);
  const SetModalOpen = (isOpen: boolean) => {
    setliquidateOven(isOpen);
  };

  const modals = useMemo(() => {
    return (
      <>
        <LiquidateOven oven={oven} isOpen={liquidateOven} onClose={() => setliquidateOven(false)} />
      </>
    );
  }, [liquidateOven, oven]);

  const showInfo = useMemo(() => {
    return (
      <div>
        <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
          <Icon fontSize="2xl" color={text4} as={MdInfo} m={1} />
          <Text color="gray.500" fontSize="xs" ml={2}>
            Deposit more tez as collateral or burn ctez, to avoid liquidation
          </Text>
        </Flex>
      </div>
    );
  }, [cardbg, text4]);

  return (
    <div>
      <Stack
        direction="row"
        backgroundColor={value > 100 ? '#FFE3E2AA' : value > 80 ? '#F6F5E5AA' : '#E5F6EFAA'}
        borderRadius={16}
        px={4}
        pb={value > 100 || warning ? '4' : '0'}
        w="100%"
      >
        <Box h={2} borderRadius={4} w="100%" my="auto" backgroundColor={progressPillBg}>
          <Box
            h="100%"
            w={value > 100 ? '100' : `${value}%`}
            borderRadius={4}
            backgroundColor={value > 100 ? '#CC3936' : value > 80 ? '#F3DD63' : '#38CB89'}
          />
        </Box>
        <Text maxWidth={40}>{value}%</Text>
        {modals}
      </Stack>
      {value > 100 && type === 'AllOvens' && (
        <Text
          color={red}
          position="relative"
          top="-22px"
          left="22"
          fontSize="12px"
          fontWeight="500"
          h={0}
          onClick={(e) => SetModalOpen(true)}
          _hover={{ cursor: 'pointer' }}
        >
          {t('liquidateOven')}
          <Icon ml={1} as={BsArrowRight} />
        </Text>
      )}
      {type === 'AllOvens' && warning && value < 100 && (
        <Text
          color={orange}
          position="relative"
          top="-22px"
          left="22"
          fontSize="12px"
          fontWeight="500"
          h={0}
          _hover={{ cursor: 'pointer' }}
        >
          <Tooltip label={showInfo} placement="right" borderRadius={14} backgroundColor={cardbg}>
            {t('actionRequired')}
          </Tooltip>
        </Text>
      )}
    </div>
  );
};

export default ProgressPill;
