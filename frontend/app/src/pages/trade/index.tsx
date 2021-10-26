import { Flex } from '@chakra-ui/react';
import Trade from '../../components/Trade';

const TradePage: React.FC = () => {
  return (
    <Flex height="calc(100vh - 72px)" alignItems="center" justifyContent="center">
      <Trade />
    </Flex>
  );
};

export default TradePage;
