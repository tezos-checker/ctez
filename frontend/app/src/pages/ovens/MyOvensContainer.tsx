import { Center, Text } from '@chakra-ui/react';
import React, { useEffect, useMemo } from 'react';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';
import { useWallet } from '../../wallet/hooks';
import { useOvenDataByAddresses, useUserOvenData } from '../../api/queries';
import { getExternalOvens } from '../../utils/ovenUtils';
import { CTEZ_ADDRESS } from '../../utils/globals';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setExternalOvens } from '../../redux/slices/OvenSlice';
import { AllOvenDatum } from '../../interfaces';

const MyOvensContainer: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const dispatch = useAppDispatch();

  const { data: myOvens, isLoading } = useUserOvenData(userAddress);

  const extOvensAddresses = useAppSelector((state) => state.oven.extOvens);

  useEffect(() => {
    if (userAddress && CTEZ_ADDRESS) {
      dispatch(setExternalOvens(getExternalOvens(userAddress, CTEZ_ADDRESS)));
    }
  }, [dispatch, userAddress]);

  const extOvens = useOvenDataByAddresses(extOvensAddresses);

  const extOvensData = useMemo<AllOvenDatum[]>(() => {
    return extOvens
      .filter((oven) => !!oven.data)
      .map((oven) => ({ ...(oven.data as AllOvenDatum), isImported: true }));
  }, [extOvens]);

  const sortedOvens = useSortedOvensList([...(myOvens ?? []), ...extOvensData]);

  if (userAddress == null) {
    return (
      <Center>
        <Text>Connect your wallet to get started</Text>
      </Center>
    );
  }

  if (isLoading) {
    return <SkeletonLayout component="OvenCard" />;
  }

  return (
    <>
      {sortedOvens?.map((oven) => (
        <OvenCard key={oven.value.address} oven={oven} type="MyOvens" />
      ))}
    </>
  );
};

export default MyOvensContainer;
