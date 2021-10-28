import { Box, Grid, SkeletonText } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useThemeColors } from '../../hooks/utilHooks';

const OvenCardSkeleton: React.FC = () => {
  const [background] = useThemeColors(['cardbg']);
  const items = useMemo(() => Array(6).fill(0), []);

  return (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor={background}
    >
      {items.map((item, index) => (
        <Box key={index}>
          <SkeletonText pr={6} noOfLines={2} spacing="4" />
        </Box>
      ))}
    </Grid>
  );
};

export default OvenCardSkeleton;
