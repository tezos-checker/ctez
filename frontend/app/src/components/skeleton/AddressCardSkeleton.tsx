import { Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react';

const AddressCardSkeleton: React.FC = () => {
  return (
    <Flex w="100%" boxShadow="lg" px={3} py={1} borderRadius={6} alignItems="center">
      <SkeletonCircle size="8" />
      <Skeleton height={4} ml={2} flexGrow={1} />
    </Flex>
  );
};

export default AddressCardSkeleton;
