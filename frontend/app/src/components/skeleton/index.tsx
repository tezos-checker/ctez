import { Skeleton } from '@chakra-ui/react';
import { useCallback } from 'react';
import OvenCardSkeleton from './OvenCardSkeleton';
import AddressCardSkeleton from './AddressCardSkeleton';

interface ISkeletonLayout {
  count?: number;
  component: 'OvenCard' | 'AddressCard';
}

const SkeletonLayout: React.FC<ISkeletonLayout> = (props) => {
  const renderSkeleton = useCallback(
    (x, i: number) => {
      if (props.component === 'OvenCard') {
        return <OvenCardSkeleton key={i} />;
      }

      if (props.component === 'AddressCard') {
        return <AddressCardSkeleton key={i} />;
      }

      return <Skeleton key={i} />;
    },
    [props.component],
  );

  return (
    <>
      {Array(props.count ?? 5)
        .fill(0)
        .map(renderSkeleton)}
    </>
  );
};

export default SkeletonLayout;
