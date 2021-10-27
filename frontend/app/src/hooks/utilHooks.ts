import {
  createElement,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TransactionWalletOperation, WalletOperation } from '@taquito/taquito';
import { Flex, Spinner, useToast } from '@chakra-ui/react';
import { GroupBase, OptionsOrGroups } from 'react-select';
import { getOvenMaxCtez } from '../utils/ovenUtils';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { formatNumber } from '../utils/numbers';
import { AllOvenDatum, Baker, BaseStats } from '../interfaces';
import { logger } from '../utils/logger';
import { cfmmError } from '../contracts/cfmm';
import { openTxSubmittedModal } from '../redux/slices/UiSlice';
import { useCtezBaseStats } from '../api/queries';

type TUseOvenStats = (
  oven: AllOvenDatum | undefined | null,
) => {
  stats: null | {
    ovenBalance: number;
    outStandingCtez: number;
    maxMintableCtez: number;
    remainingMintableCtez: number;
    collateralUtilization: string;
    collateralRatio: string;
    reqTezBalance: number;
    withdrawableTez: number;
  };
  baseStats: BaseStats | undefined;
};

const useOvenStats: TUseOvenStats = (oven) => {
  const { data } = useCtezBaseStats();
  const currentTarget = Number(data?.currentTarget);
  const currentTargetMintable = Number(data?.originalTarget);

  const stats = useMemo(() => {
    if (oven == null) {
      return null;
    }

    const { tezBalance, ctezOutstanding } = (() => {
      return {
        tezBalance: oven?.value.tez_balance,
        ctezOutstanding: oven?.value.ctez_outstanding,
      };
    })();

    const { max, remaining } = currentTargetMintable
      ? getOvenMaxCtez(
          formatNumber(tezBalance, 0),
          formatNumber(ctezOutstanding, 0),
          currentTargetMintable,
        )
      : { max: 0, remaining: 0 };

    const ovenBalance = formatNumber(tezBalance, -6) ?? 0;
    const outStandingCtez = formatNumber(ctezOutstanding, -6) ?? 0;
    const maxMintableCtez = formatNumber(max < 0 ? 0 : max, 0);
    const remainingMintableCtez = remaining < 0 ? 0 : remaining;

    let collateralUtilization = formatNumber(
      (formatNumber(ctezOutstanding, 0) / maxMintableCtez) * 100,
    ).toFixed(1);

    if (collateralUtilization === 'NaN') {
      collateralUtilization = '0';
    }

    const collateralRatio = (100 * (100 / Number(collateralUtilization))).toFixed(1);

    const reqTezBalance = (() => {
      if (currentTarget) {
        return ovenBalance * currentTarget > outStandingCtez
          ? 0
          : outStandingCtez / currentTarget - ovenBalance;
      }
      return 0;
    })();

    const withdrawableTez =
      ovenBalance * (1 - formatNumber(formatNumber(ctezOutstanding, 0) / maxMintableCtez));

    return {
      ovenBalance,
      outStandingCtez,
      maxMintableCtez,
      remainingMintableCtez,
      collateralUtilization,
      collateralRatio,
      reqTezBalance,
      withdrawableTez,
    };
  }, [currentTarget, currentTargetMintable, oven]);

  return { stats, baseStats: data };
};

type TUseSortedOvensList = (ovens: AllOvenDatum[] | undefined) => AllOvenDatum[] | null;

const useSortedOvensList: TUseSortedOvensList = (ovens) => {
  const sortByOption = useAppSelector((state) => state.oven.sortByOption);
  const { data } = useCtezBaseStats();
  const calculateUtilization = useCallback(
    (oven: AllOvenDatum) => {
      const currentTargetMintable = Number(data?.originalTarget);
      const { tezBalance, ctezOutstanding } = (() => {
        return {
          tezBalance: oven?.value.tez_balance,
          ctezOutstanding: oven?.value.ctez_outstanding,
        };
      })();
      const { max } = currentTargetMintable
        ? getOvenMaxCtez(
            formatNumber(tezBalance, 0),
            formatNumber(ctezOutstanding, 0),
            currentTargetMintable,
          )
        : { max: 0 };
      const maxMintableCtez = formatNumber(max < 0 ? 0 : max, 0);
      let collateralUtilization = formatNumber(
        (formatNumber(oven.value.ctez_outstanding, 0) / maxMintableCtez) * 100,
      ).toFixed(1);
      if (collateralUtilization === 'NaN') {
        collateralUtilization = '0';
      }
      return collateralUtilization;
    },
    [data],
  );

  return useMemo(() => {
    if (ovens == null) {
      return null;
    }

    if (sortByOption === 'Oven Balance') {
      return ovens
        .slice()
        .sort((a, b) => (Number(a.value.tez_balance) < Number(b.value.tez_balance) ? 1 : -1));
    }

    if (sortByOption === 'Outstanding') {
      return ovens
        .slice()
        .sort((a, b) =>
          Number(a.value.ctez_outstanding) < Number(b.value.ctez_outstanding) ? 1 : -1,
        );
    }
    if (sortByOption === 'Utilization') {
      return ovens
        .slice()
        .sort((a, b) =>
          Number(calculateUtilization(a)) < Number(calculateUtilization(b)) ? 1 : -1,
        );
    }

    return ovens;
  }, [calculateUtilization, ovens, sortByOption]);
};

const useTxLoader = (): ((
  result: WalletOperation | TransactionWalletOperation,
) => Promise<boolean>) => {
  const toast = useToast({
    position: 'bottom-right',
    variant: 'left-accent',
  });
  const toastId = useMemo(() => (Math.random() + 1).toString(36).substring(2), []);
  const dispatch = useAppDispatch();

  return useCallback(
    (result: WalletOperation | TransactionWalletOperation) => {
      dispatch(openTxSubmittedModal({ opHash: result.opHash }));

      if (result.opHash) {
        toast({
          id: toastId,
          render() {
            return createElement(
              Flex,
              {
                direction: 'row-reverse',
              },
              createElement(Spinner, null),
            );
          },
          duration: null,
        });

        return result
          .confirmation()
          .then((txResult) => {
            if (txResult.completed) {
              toast.update(toastId, {
                status: 'success',
                description: 'Transaction Confirmed',
                duration: 5_000,
              });

              return true;
            }
            toast.update(toastId, {
              status: 'error',
              description: 'Error',
              duration: 5_000,
            });

            return false;
          })
          .catch((error) => {
            logger.warn(error);
            const errorText =
              cfmmError[error.data?.[1]?.with?.int as number] || 'Transaction Failed';
            toast({
              status: 'error',
              description: errorText,
              duration: 5_000,
            });
            return false;
          });
      }

      return new Promise(() => false);
    },
    [dispatch, toast, toastId],
  );
};

type TOption = { label: string; value: string };

type TUseBakerSelect = (
  delegates: Baker[] | undefined,
) => {
  bakerSelect: TOption | null;
  setBakerSelect: Dispatch<SetStateAction<TOption | null>>;
  options: OptionsOrGroups<TOption, GroupBase<TOption>>;
  setOptions: Dispatch<SetStateAction<OptionsOrGroups<TOption, GroupBase<TOption>>>>;
  handleBakerCreate: (e: string) => void;
};

const useBakerSelect: TUseBakerSelect = (delegates) => {
  const createOption = useCallback<(label: string) => TOption>(
    (label) => ({
      label,
      value: label,
    }),
    [],
  );

  const [bakerSelect, setBakerSelect] = useState<TOption | null>(null);
  const [options, setOptions] = useState<OptionsOrGroups<TOption, GroupBase<TOption>>>([]);

  useEffect(() => {
    setOptions(delegates?.map((x) => createOption(x.address)) ?? []);
  }, [createOption, delegates]);

  const handleBakerCreate = useCallback(
    (e: string) => {
      const newOption = createOption(e);
      setOptions((prev) => [...prev, newOption]);
      setBakerSelect(newOption);
    },
    [createOption],
  );

  return { bakerSelect, setBakerSelect, options, setOptions, handleBakerCreate };
};

export { useOvenStats, useSortedOvensList, useTxLoader, useBakerSelect };
