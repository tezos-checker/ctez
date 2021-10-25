import { Box, Center, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { useSetAllOvensToStore, useSetExtOvensToStore } from '../../hooks/setApiDataToStore';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useMyOvensSelector } from '../../hooks/reduxSelectors';
import { useSortedOvensList } from '../../hooks/utilHooks';

const MyOvensContainer: React.FC<{ userAddress: string | undefined }> = ({ userAddress }) => {
  useSetAllOvensToStore();
  useSetExtOvensToStore(userAddress);
  const background = useColorModeValue('white', 'cardbgdark');
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
    <Box
      height="68vh"
      overflow="auto"
      sx={{
        '&::-webkit-scrollbar': {
          left: '-10px',
          width: '16px',
          borderRadius: '12px',
          backgroundColor: `${background}`,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#babac0',
          borderRadius: '12px',
          boxShadow: `inset 0 0 10px 10px transparent`,
          border: `solid 4px ${background}`,
        },
        '&::-webkit-scrollbar-track': {
          borderRadius: '12px',
          boxShadow: 'inset 0 0 10px 10px transparent',
          border: `solid 4px ${background}`,
          backgroundColor: `${background}`,
        },
      }}
    >
      {sortedOvens?.map((oven) => (
        <OvenCard key={oven.value.address} oven={oven} type="MyOvens" />
      ))}
    </Box>
  );
};

export default MyOvensContainer;
