import { Stack, useMediaQuery } from '@chakra-ui/react';
import OvenInfo from '../../../components/OvenCard/OvenInfo';
import OvenStats from '../../../components/OvenCard/OvenStats';
import OvenOperations from '../../../components/OvenCard/OvenOperations';

const OvenIdPage: React.FC = () => {
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);

  return (
    <Stack
      direction={largerScreen ? 'row' : 'column'}
      maxWidth={1200}
      mx="auto"
      my={4}
      p={4}
      w="100%"
      spacing={4}
    >
      <Stack direction="column" w={largerScreen ? '50%' : '100%'} spacing={4}>
        <OvenInfo />

        <OvenStats />
      </Stack>

      <OvenOperations largerScreen={largerScreen} />
    </Stack>
  );
};

export default OvenIdPage;
