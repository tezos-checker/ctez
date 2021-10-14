import { useSetAllOvensToStore } from '../../hooks/setApiDataToStore';
import { useAppSelector } from '../../redux/store';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';

export const AllOvensContainer: React.FC = () => {
  useSetAllOvensToStore();
  const { data, isLoading } = useAppSelector((state) => state.oven.allOvens);
  const sortedOvens = useSortedOvensList(data);

  if (isLoading) {
    return <SkeletonLayout count={7} component="OvenCard" />;
  }

  return (
    <>
      {sortedOvens?.map((oven) => (
        <OvenCard key={oven.id} oven={oven} type="AllOvens" />
      ))}
    </>
  );
};
