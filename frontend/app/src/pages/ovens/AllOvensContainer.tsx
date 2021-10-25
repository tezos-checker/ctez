import React from 'react';
import { useSetAllOvensToStore } from '../../hooks/setApiDataToStore';
import { useAppSelector } from '../../redux/store';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';

const AllOvensContainer: React.FC = () => {
  useSetAllOvensToStore();
  const { data, isLoading } = useAppSelector((state) => state.oven.allOvens);
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
