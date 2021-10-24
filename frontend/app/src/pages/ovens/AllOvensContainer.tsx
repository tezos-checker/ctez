import { Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { useSetAllOvensToStore } from '../../hooks/setApiDataToStore';
import { useAppSelector } from '../../redux/store';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';

export const AllOvensContainer: React.FC = () => {
  useSetAllOvensToStore();
  const background = useColorModeValue('white', 'cardbgdark');
  const { data, isLoading } = useAppSelector((state) => state.oven.allOvens);
  const sortedOvens = useSortedOvensList(data);

  // if (isLoading) {
  //
  // }

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
      {isLoading ? (
        <SkeletonLayout count={7} component="OvenCard" />
      ) : (
        sortedOvens?.map((oven) => <OvenCard key={oven.id} oven={oven} type="AllOvens" />)
      )}
    </Box>
  );
};
