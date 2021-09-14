import { Box, Grid, Text } from '@chakra-ui/react';
import { OvenSerializable } from '../../interfaces';
import ProgressPill from './ProgressPill';

const truncateText = (text: string | null) => {
  if (text == null) {
    return '';
  }

  const len = text.length;
  return `${text.substr(0, 5)}...${text.substr(len - 5)}`;
};

const OvenCard: React.FC<{ oven: OvenSerializable }> = ({ oven }) => {
  const renderItems = () => {
    const items = [
      { label: 'Oven address', value: truncateText(oven.address) },
      { label: 'Baker', value: truncateText(oven.baker) },
      { label: 'Oven Balance', value: `${oven.tez_balance} XTZ` },
      { label: 'Outstanding ', value: `${oven.ctez_outstanding} cTEZ` },
      { label: 'Mintable ', value: `500.41 cTEZ` },
    ];

    return items.map((item) => (
      <Box key={item.label}>
        <Text>{item.value}</Text>
        <Text fontSize="xs">{item.label}</Text>
      </Box>
    ));
  };

  return (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor="white"
    >
      {renderItems()}

      <Box>
        <ProgressPill value={75} />
        <Text fontSize="xs">Collateral Utilization</Text>
      </Box>
    </Grid>
  );
};

export default OvenCard;
