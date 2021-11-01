import { Center, Text } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import OvenSummary from '../../components/OvenSummary/OvenSummary';
import { useSortedOvensList } from '../../hooks/utilHooks';
import { useWallet } from '../../wallet/hooks';
import { useOvenDataByAddresses, useUserOvenData } from '../../api/queries';
import { getExternalOvens, removeExternalOven } from '../../utils/ovenUtils';
import { CTEZ_ADDRESS } from '../../utils/globals';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { setExternalOvens, setRemoveOven } from '../../redux/slices/OvenSlice';
import { AllOvenDatum } from '../../interfaces';

const MyOvensContainer: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();
  const dispatch = useAppDispatch();
  const { data: myOvens, isLoading } = useUserOvenData(userAddress);
  const removeTrackedOven = useAppSelector((state) => state.oven.removeOven);
  const extOvensAddressesFromState = useAppSelector((state) => state.oven.extOvens);
  const [extOvensAddresses, setExtOvensAddresses] = useState<string[]>(extOvensAddressesFromState);
  useEffect(() => {
    if (removeTrackedOven) {
      const extOvensAddressesAfterRemoval = extOvensAddresses.filter(
        (address) => address !== removeTrackedOven,
      );
      setExtOvensAddresses(extOvensAddressesAfterRemoval);
    } else {
      setExtOvensAddresses(extOvensAddressesFromState);
    }
  }, [removeTrackedOven, extOvensAddressesFromState]);

  useEffect(() => {
    if (userAddress && CTEZ_ADDRESS) {
      dispatch(setExternalOvens(getExternalOvens(userAddress, CTEZ_ADDRESS)));
      if (removeTrackedOven) {
        removeExternalOven(userAddress, CTEZ_ADDRESS, removeTrackedOven);
        dispatch(setRemoveOven(''));
      }
    }
  }, [dispatch, userAddress, removeTrackedOven]);

  const extOvens = useOvenDataByAddresses(extOvensAddresses);

  const extOvensData = useMemo<AllOvenDatum[]>(() => {
    return extOvens
      .filter((oven) => !!oven.data)
      .map((oven) => ({ ...(oven.data as AllOvenDatum), isImported: true }));
  }, [extOvens, extOvensAddresses]);

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
      <OvenSummary ovens={sortedOvens || []} />
      {sortedOvens?.map((oven) => (
        <OvenCard key={oven.value.address} oven={oven} type="MyOvens" />
      ))}
    </>
  );
};

export default MyOvensContainer;
