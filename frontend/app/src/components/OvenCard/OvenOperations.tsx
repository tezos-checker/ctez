import { Box } from '@chakra-ui/react';

interface IOvenOperationsProps {
  largerScreen: boolean;
}

const OvenOperations: React.FC<IOvenOperationsProps> = (props) => {
  return <Box w={props.largerScreen ? '50%' : '100%'}>Oven Operations</Box>;
};

export default OvenOperations;
