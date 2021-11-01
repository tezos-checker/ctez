import React, { useEffect, useMemo, useState } from 'react';
import { Paginator, Container, Previous, usePaginator, Next, PageGroup } from 'chakra-paginator';
import { ButtonProps } from '@chakra-ui/button';
import SkeletonLayout from '../../components/skeleton';
import OvenCard from '../../components/OvenCard/OvenCard';
import { useSortedOvensList } from '../../hooks/utilHooks';
import { useAllOvenData } from '../../api/queries';

const AllOvensContainer: React.FC = () => {
  const { data, isLoading } = useAllOvenData();
  const sortedOvens = useSortedOvensList(data);
  const [currentPageOvens, setCurrentPageOvens] = useState(sortedOvens);
  const baseStyles: ButtonProps = {
    w: 7,
    fontSize: 'sm',
  };
  const activeStyles: ButtonProps = {
    ...baseStyles,
    _hover: {
      bg: 'light.text4',
    },
    bg: 'light.text4',
  };
  const outerLimit = 2;
  const innerLimit = 2;
  const { pagesQuantity, offset, currentPage, setCurrentPage, isDisabled, pageSize } = usePaginator(
    {
      total: data?.length,
      initialState: {
        pageSize: 10,
        isDisabled: false,
        currentPage: 1,
      },
    },
  );
  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
  };

  useEffect(() => {
    const indexOfLastOven = currentPage * pageSize;
    const indexOfFirstOven = indexOfLastOven - pageSize;
    const currentTodos = sortedOvens && sortedOvens.slice(indexOfFirstOven, indexOfLastOven);
    setCurrentPageOvens(currentTodos);
  }, [currentPage, pageSize, offset, sortedOvens]);

  const modals = useMemo(() => {
    return (
      <>
        <Paginator
          isDisabled={isDisabled}
          innerLimit={innerLimit}
          currentPage={currentPage}
          outerLimit={outerLimit}
          pagesQuantity={pagesQuantity}
          activeStyles={activeStyles}
          normalStyles={baseStyles}
          onPageChange={handlePageChange}
        >
          <Container align="center" justify="space-between" w="full" p={4}>
            <Previous>Previous</Previous>
            <PageGroup isInline align="center" />
            <Next>Next</Next>
          </Container>
        </Paginator>
      </>
    );
  }, [data]);

  return (
    <>
      {isLoading ? (
        <SkeletonLayout count={10} component="OvenCard" />
      ) : (
        currentPageOvens?.map((oven) => <OvenCard key={oven.id} oven={oven} type="AllOvens" />)
      )}
      {modals}
    </>
  );
};

export default AllOvensContainer;
