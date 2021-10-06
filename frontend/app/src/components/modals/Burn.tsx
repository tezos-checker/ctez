import {
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
// import BigNumber from 'bignumber.js';
import { number, object } from 'yup';
import { useFormik } from 'formik';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../redux/store';
// import { getOvenMaxCtez } from '../../utils/ovenUtils';
import { isMonthFromLiquidation } from '../../api/contracts';
import { IMintRepayForm } from '../../constants/oven-operations';
import { cTezError, mintOrBurn } from '../../contracts/ctez';
import { logger } from '../../utils/logger';
import { useOvenStats } from '../../hooks/utilHooks';
import Button from '../button/Button';
import { BUTTON_TXT, TButtonText, TOKEN, TToken } from '../../constants/swap';
import { CTezIcon } from '../icons';

interface IBurnProps {
  isOpen: boolean;
  onClose: () => void;
}

const Burn: React.FC<IBurnProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const [buttonText, setButtonText] = useState<TButtonText>(BUTTON_TXT.ENTER_AMT);
  const { oven, stats, ovenId } = useOvenStats();
  const text2 = useColorModeValue('text2', 'darkheading');
  const text4 = useColorModeValue('text4', 'darkheading');
  const text1 = useColorModeValue('text1', 'darkheading');
  const inputbg = useColorModeValue('darkheading', 'textboxbg');
  const cardbg = useColorModeValue('bg3', 'darkblue');

  const getRightElement = useCallback((token: TToken) => {
    return (
      <InputRightElement backgroundColor="transparent" w={24} color={text2}>
        <CTezIcon height={28} width={28} />
        <Text fontWeight="500" mx={2}>
          ctez
        </Text>
      </InputRightElement>
    );
  }, []);

  const { tez_balance, ctez_outstanding } = useMemo(
    () =>
      oven ?? {
        ovenId: 0,
        tez_balance: '0',
        ctez_outstanding: '0',
      },
    [oven],
  );

  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);
  const drift = useAppSelector((state) => state.stats.baseStats?.drift);
  // const { max, remaining } = currentTarget
  //   ? getOvenMaxCtez(tez_balance, ctez_outstanding, currentTarget)
  //   : { max: 0, remaining: 0 };

  // const outStandingCtez = new BigNumber(ctez_outstanding).shiftedBy(-6).toNumber() ?? 0;
  // const maxMintableCtez = max < 0 ? 0 : max;
  // const remainingMintableCtez = remaining < 0 ? 0 : remaining;
  const validationSchema = object().shape({
    amount: number()
      .min(0.000001)
      .test({
        test: (value) => {
          if (value) {
            const ctezOutstanding = Number(ctez_outstanding) / 1e6;
            return value <= ctezOutstanding;
          }
          return false;
        },
        message: t('excessiveBurnError'),
      })
      .required(t('required')),
  });
  const initialValues: any = {
    amount: '',
  };

  const handleFormSubmit = async (data: IMintRepayForm) => {
    if (oven?.ovenId) {
      try {
        const amount = -data.amount;
        const result = await mintOrBurn(Number(ovenId), amount);
        if (result) {
          toast({
            description: t('txSubmitted'),
            status: 'success',
          });
        }
      } catch (error) {
        logger.warn(error);
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
        toast({
          description: errorText,
          status: 'error',
        });
      }
    }
  };

  const { values, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });

  useEffect(() => {
    if (values.amount) {
      setButtonText(BUTTON_TXT.BURN);
    } else {
      setButtonText(BUTTON_TXT.ENTER_AMT);
    }
  }, [buttonText, values.amount]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader color={text1} fontWeight="500">
            Burn cTez
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
              <Icon fontSize="2xl" color="#B0B7C3" as={MdInfo} m={1} />
              <Text fontSize="xs" ml={2}>
                If the collateral ratio in a vault is observed at or below the emergency collateral
                ratio, the vault becomes available for liquidation.
              </Text>
            </Flex>
            <FormControl id="to-input-amount" mt={2} mb={6} w="100%">
              <FormLabel fontWeight="500" color={text2} fontSize="xs">
                Amount
              </FormLabel>
              <InputGroup>
                <Input
                  type="number"
                  name="amount"
                  id="amount"
                  color={text4}
                  bg={inputbg}
                  value={values.amount}
                  onChange={handleChange}
                  placeholder="0.0"
                />
                {getRightElement(TOKEN.Tez)}
              </InputGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button w="100%" variant="outline" type="submit">
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default Burn;
