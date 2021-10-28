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
  useToast,
} from '@chakra-ui/react';
import { MdInfo } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useCallback, useMemo } from 'react';
import { useAppSelector } from '../../redux/store';
import { isMonthFromLiquidation } from '../../api/contracts';
import { IMintRepayForm } from '../../constants/oven-operations';
import { cTezError, mintOrBurn } from '../../contracts/ctez';
import { logger } from '../../utils/logger';
import Button from '../button/Button';
import { BUTTON_TXT } from '../../constants/swap';
import { CTezIcon } from '../icons';
import { AllOvenDatum } from '../../interfaces';
import { useOvenStats, useThemeColors, useTxLoader } from '../../hooks/utilHooks';
import { formatNumberStandard } from '../../utils/numbers';

interface IMintProps {
  isOpen: boolean;
  onClose: () => void;
  oven: AllOvenDatum | null;
}

const Mint: React.FC<IMintProps> = ({ isOpen, onClose, oven }) => {
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const { stats } = useOvenStats(oven);
  const [cardbg, text2, text1, inputbg, text4Text4, maxColor] = useThemeColors([
    'tooltipbg',
    'text2',
    'text1',
    'inputbg',
    'text4',
    'maxColor',
  ]);
  const handleProcessing = useTxLoader();

  const getRightElement = useCallback(() => {
    return (
      <InputRightElement backgroundColor="transparent" w={24} color={text2}>
        <CTezIcon height={28} width={28} />
        <Text fontWeight="500" mx={2}>
          ctez
        </Text>
      </InputRightElement>
    );
  }, [text2]);

  const { tez_balance, ctez_outstanding } = useMemo(
    () =>
      oven?.value ?? {
        tez_balance: '0',
        ctez_outstanding: '0',
      },
    [oven],
  );

  const currentTarget = useAppSelector((state) => state.stats.baseStats?.originalTarget);
  const drift = useAppSelector((state) => state.stats.baseStats?.drift);
  const maxValue = (): number => stats?.remainingMintableCtez ?? 0;
  // const { max, remaining } = currentTarget
  //   ? getOvenMaxCtez(tez_balance, ctez_outstanding, currentTarget)
  //   : { max: 0, remaining: 0 };

  // const outStandingCtez = new BigNumber(ctez_outstanding).shiftedBy(-6).toNumber() ?? 0;
  // const maxMintableCtez = max < 0 ? 0 : max;
  // const remainingMintableCtez = remaining < 0 ? 0 : remaining;
  const validationSchema = Yup.object().shape({
    amount: Yup.number()
      .min(0.000001)
      .max(maxValue(), `${t('insufficientBalance')}`)
      .test({
        test: (value) => {
          if (value !== undefined && drift !== undefined && currentTarget !== undefined) {
            const newOutstanding = Number(ctez_outstanding) + value * 1e6;
            const tez = Number(tez_balance);
            const result = isMonthFromLiquidation(newOutstanding, currentTarget, tez, drift);
            return !result;
          }
          return false;
        },
        message: t('excessiveMintingError'),
      })
      .required(t('required')),
  });
  const initialValues: IMintRepayForm = {
    amount: 0,
  };

  const handleFormSubmit = async (data: IMintRepayForm) => {
    if (oven?.key.id) {
      try {
        const amount = data?.amount;
        const result = await mintOrBurn(Number(oven.key.id), amount);
        handleProcessing(result);
        onClose();
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

  const { values, handleChange, handleSubmit, isSubmitting, errors, ...formik } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleFormSubmit,
  });
  const { buttonText, errorList } = useMemo(() => {
    const errorListLocal = Object.values(errors);
    if (values.amount) {
      if (errorListLocal.length > 0) {
        return { buttonText: errorListLocal[0], errorList: errorListLocal };
      }

      return { buttonText: BUTTON_TXT.MINT, errorList: errorListLocal };
    }

    return { buttonText: BUTTON_TXT.ENTER_AMT, errorList: errorListLocal };
  }, [errors, values.amount]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <ModalHeader color={text1} fontWeight="500">
            Mint ctez
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mr={-2} ml={-2} p={2} borderRadius={14} backgroundColor={cardbg}>
              <Icon fontSize="2xl" color={text4Text4} as={MdInfo} m={1} />
              <Text fontSize="xs" ml={2}>
                If the collateral ratio in a vault is observed at or below the emergency collateral
                ratio, the vault becomes available for liquidation. This applies until the
                collateralratio is re-established at or above the target collateral ratio.
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
                  color={text2}
                  bg={inputbg}
                  lang="en-US"
                  placeholder="0.0"
                  value={values.amount}
                  onChange={handleChange}
                />
                {getRightElement()}
              </InputGroup>
              <Text color={text4Text4} fontSize="xs" mt={1}>
                Balance: {formatNumberStandard(stats?.remainingMintableCtez ?? 0)}{' '}
                <Text
                  as="span"
                  cursor="pointer"
                  color={maxColor}
                  onClick={() =>
                    formik.setFieldValue(
                      'amount',
                      formatNumberStandard(stats?.remainingMintableCtez),
                    )
                  }
                >
                  (Max)
                </Text>
              </Text>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              w="100%"
              variant="outline"
              type="submit"
              disabled={isSubmitting || errorList.length > 0}
            >
              {buttonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default Mint;
