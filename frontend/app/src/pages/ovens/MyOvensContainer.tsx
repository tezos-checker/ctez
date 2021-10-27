import { Center, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';
import { useWallet } from '../../wallet/hooks';
import { useUserOvenData } from '../../api/queries';
import { getExternalOvens } from '../../utils/ovenUtils';
import { CTEZ_ADDRESS } from '../../utils/globals';

const MyOvensContainer: React.FC = () => {
  const [{ pkh: userAddress }] = useWallet();

  const extOvensAddresses = useMemo(() => {
    if (!userAddress || !CTEZ_ADDRESS) {
      return [];
    }

    return getExternalOvens(userAddress, CTEZ_ADDRESS);
  }, [userAddress]);

  const { data: myOvens } = useUserOvenData(userAddress);

  // const myOvens = useMemo(() => {
  //   if (!userAddress) {
  //     return [];
  //   }
  //
  //   return [
  //     ...(allOvens?.filter((oven) => oven.key.owner === userAddress) ?? []),
  //     ...(allOvens
  //       ?.filter((oven) => extOvensAddresses.includes(oven.value.address))
  //       .map((oven) => ({ ...oven, isImported: true })) ?? []),
  //   ];
  // }, [allOvens, extOvensAddresses, userAddress]);

  const sortedOvens = useSortedOvensList(myOvens);

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
