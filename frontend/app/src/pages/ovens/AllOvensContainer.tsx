import React from 'react';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';
import { useAllOvenData } from '../../api/queries';

const AllOvensContainer: React.FC = () => {
  const { data, isLoading } = useAllOvenData();
  const sortedOvens = useSortedOvensList(data);

  return (
    <>
      {isLoading ? (
        <SkeletonLayout count={7} component="OvenCard" />
      ) : (
        sortedOvens?.map((oven) => <OvenCard key={oven.id} oven={oven} type="AllOvens" />)
      )}
    </>
  );
};

export default AllOvensContainer;
