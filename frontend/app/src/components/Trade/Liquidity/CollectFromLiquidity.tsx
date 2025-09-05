import { Flex, FormControl, FormLabel, Input, Stack, useToast, InputGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import BigNumber from 'bignumber.js';
import { CollectFromLiquidityParams } from '../../../interfaces';
import { collectFromLiquidity } from '../../../contracts/ctez';
import { COLLECT_BTN_TXT } from '../../../constants/liquidity';
import { useWallet } from '../../../wallet/hooks';
import { useActualCtezStorage, useUserLqtData } from '../../../api/queries';
import Button from '../../button';
import { useThemeColors, useTxLoader } from '../../../hooks/utilHooks';
import { calcRedeemedAmount } from './utlils';
import DexSideSelector, { DexSide } from './DexSideSelector';
import TokenInputIcon from '../TokenInputIcon';
import { TOKEN } from '../../../constants/swap';

const CollectFromLiquidity: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const [side, setSide] = React.useState<DexSide>('ctez')
  const [otherValues, setOtherValues] = useState({
    proceedsReceived: '0',
    subsidyReceived: '0',
  });
  const toast = useToast();
  const { data: ctezStorage } = useActualCtezStorage();
  const { t } = useTranslation(['common']);
  const [text2, inputbg] = useThemeColors([
    'text2',
    'inputbg',
  ]);
  const handleProcessing = useTxLoader();
  const { data: userLqtData } = useUserLqtData(userAddress);

  const isCtezSide = side === 'ctez';
  const lqtBalance = (isCtezSide ? userLqtData?.ctezDexLqt : userLqtData?.tezDexLqt) ?? new BigNumber(0);

  const calcMinValues = useCallback(
    async () => {
      if (!lqtBalance) {
        setOtherValues({
          proceedsReceived: '0',
          subsidyReceived: '0',
        });
      } else if (ctezStorage && userAddress) {
        const dex = isCtezSide ? ctezStorage.sell_ctez : ctezStorage.sell_tez;
        const account = await dex.liquidity_owners.get(userAddress);
        const proceedsReceived = calcRedeemedAmount(lqtBalance, dex.proceeds_reserves, dex.total_liquidity_shares, account?.proceeds_owed ?? new BigNumber(0));
        const subsidyReceived = calcRedeemedAmount(lqtBalance, dex.subsidy_reserves, dex.total_liquidity_shares, account?.subsidy_owed ?? new BigNumber(0));

        setOtherValues({
          proceedsReceived: proceedsReceived.dividedBy(1e6).toFixed(6, BigNumber.ROUND_CEIL),
          subsidyReceived: subsidyReceived.dividedBy(1e6).toFixed(6, BigNumber.ROUND_CEIL),
        });
      }
    },
    [ctezStorage, side],
  );

  const handleFormSubmit = async () => {
    if (userAddress) {
      try {
        const data: CollectFromLiquidityParams = {
          to: userAddress,
          isCtezSide,
        };
        const result = await collectFromLiquidity(data);
        handleProcessing(result);
      } catch (error: any) {
        const errorText = error.data[1].with.string as string || t('txFailed');
        toast({
          description: errorText,
          status: 'error',
        });
      }
    }
  };

  const { handleSubmit, isSubmitting, errors } = useFormik({
    initialValues: {},
    onSubmit: handleFormSubmit,
  });

  const onHandleSideChanged = useCallback((sideValue: DexSide) => {
    setSide(sideValue);
  }, []);

  useEffect(() => {
    calcMinValues();
  }, [calcMinValues, lqtBalance, side]);

  const { buttonText, errorList } = useMemo(() => {
    if (!userAddress) {
      return { buttonText: COLLECT_BTN_TXT.CONNECT, errorList: [] };
    }
    if (lqtBalance.isGreaterThan(0)) {
      if (new BigNumber(otherValues.proceedsReceived).isZero() && new BigNumber(otherValues.subsidyReceived).isZero()) {
        return { buttonText: COLLECT_BTN_TXT.NO_WITHDRAWS, errorList: [COLLECT_BTN_TXT.NO_WITHDRAWS] };
      }
      return { buttonText: COLLECT_BTN_TXT.REDEEM, errorList: [] };
    }

    return { buttonText: COLLECT_BTN_TXT.NO_SHARE, errorList: [COLLECT_BTN_TXT.NO_SHARE] };
  }, [errors, userAddress, lqtBalance, otherValues.proceedsReceived, otherValues.subsidyReceived]);

  return (
    <form onSubmit={handleSubmit} id="remove-liquidity-form">
      <Stack colorScheme="gray" spacing={2}>
        <DexSideSelector onChange={onHandleSideChanged} value={side} />
        {/* <FormControl id="to-input-amount" mb={2}>
          <FormLabel color={text2} fontSize="xs">
            LQT Balance
          </FormLabel>
          <Input
            name="lqtBalance"
            id="lqtBalance"
            value={lqtBalance.dividedBy(1e6).toString(10)}
            color={text2}
            bg={inputbg}
            readOnly
            placeholder="0.0"
            type="text"
            lang="en-US"
          />
        </FormControl> */}

        <Flex alignItems="center" direction="column" justifyContent="space-between">
          <FormControl id="to-input-amount">
            <FormLabel color={text2} fontSize="xs">
              Proceeds to withdraw
            </FormLabel>
            <InputGroup>
              <Input
                readOnly
                mb={2}
                placeholder="0.0"
                type="text"
                color={text2}
                lang="en-US"
                value={otherValues.proceedsReceived}
              />
              <TokenInputIcon token={isCtezSide ? TOKEN.Tez : TOKEN.CTez} />
            </InputGroup>
          </FormControl>

          <FormControl id="to-input-amount">
            <FormLabel color={text2} fontSize="xs">
              Subsidy to withdraw
            </FormLabel>
            <InputGroup>
              <Input
                readOnly
                mb={2}
                placeholder="0.0"
                type="text"
                color={text2}
                lang="en-US"
                value={otherValues.subsidyReceived}
              />
              <TokenInputIcon token={TOKEN.CTez} />
            </InputGroup>
          </FormControl>
        </Flex>
        <Button
          walletGuard
          variant="outline"
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting || errorList.length > 0}
        >
          {buttonText}
        </Button>
      </Stack>
    </form>
  );
};

export default CollectFromLiquidity;
