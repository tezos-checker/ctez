import { Skeleton } from '@chakra-ui/react';
import OvenCardSkeleton from './OvenCardSkeleton';

interface ISkeletonLayout {
  count?: number;
  component: 'OvenCard';
}

const SkeletonLayout: React.FC<ISkeletonLayout> = (props) => {
  if (props.component === 'OvenCard') {
    return (
      <>
        {Array(props.count ?? 5)
          .fill(0)
          .map((x, i) => (
            <OvenCardSkeleton key={i} />
          ))}
      </>
    );
  }

  return <Skeleton />;
};

export default SkeletonLayout;
