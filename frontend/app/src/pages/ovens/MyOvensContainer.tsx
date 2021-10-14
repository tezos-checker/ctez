import { Center, Text } from '@chakra-ui/react';
import { useSetAllOvensToStore, useSetExtOvensToStore } from '../../hooks/setApiDataToStore';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useMyOvensSelector } from '../../hooks/reduxSelectors';
import { useSortedOvensList } from '../../hooks/utilHooks';

const MyOvensContainer: React.FC<{ userAddress: string | undefined }> = ({ userAddress }) => {
  useSetAllOvensToStore();
  useSetExtOvensToStore(userAddress);
  const { ovens, isLoading } = useMyOvensSelector(userAddress);
  const sortedOvens = useSortedOvensList(ovens);

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
