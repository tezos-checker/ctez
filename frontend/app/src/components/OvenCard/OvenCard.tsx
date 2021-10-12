import { Box, Grid, Text, useColorModeValue } from '@chakra-ui/react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AllOvenDatum, Oven } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { useOvenStats } from '../../hooks/utilHooks';

type TOvenCardProps =
  | {
      type: 'AllOvens';
      oven: AllOvenDatum;
    }
  | {
      type: 'MyOvens';
      oven: Oven;
    };

const truncateText = (text: string | null) => {
  if (text == null) {
    return '';
  }

  const len = text.length;
  return `${text.substr(0, 5)}...${text.substr(len - 5)}`;
};

const OvenCard: React.FC<TOvenCardProps> = (props) => {
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const { stats } = useOvenStats(props);

  const renderedItems = useMemo(() => {
    const { address, baker } = (() => {
      if (props.type === 'AllOvens' && 'value' in props.oven) {
        return {
          address: props.oven.value.address,
          baker: props.oven.key.owner, // TODO add baker address once API is done
        };
      }

      if (props.type === 'MyOvens' && 'tez_balance' in props.oven) {
        return {
          address: props.oven.address,
          baker: props.oven.baker,
        };
      }

      return { address: '', baker: '' };
    })();

    const items = [
      { label: 'Oven address', value: truncateText(address) },
      { label: 'Baker', value: truncateText(baker) },
      { label: 'Oven Balance', value: `${stats?.ovenBalance ?? 0} XTZ` },
      { label: 'Outstanding ', value: `${stats?.outStandingCtez ?? 0} cTEZ` },
      { label: 'Mintable ', value: `${stats?.maxMintableCtez} cTEZ` },
    ];

    return (
      <>
        {items.map((item) => (
          <Box key={item.label}>
            {item.label === 'Oven address' ? (
              <Text
                color={textcolor}
                onClick={() => navigator.clipboard.writeText(address)}
                _hover={{ cursor: 'pointer' }}
                fontWeight="600"
              >
                {item.value}
              </Text>
            ) : (
              <Text color={textcolor} fontWeight="600">
                {item.value}
              </Text>
            )}
            <Text fontWeight="500" color="#B0B7C3" fontSize="xs">
              {item.label}
            </Text>
          </Box>
        ))}
        <Box>
          <ProgressPill value={Number(stats?.collateralUtilization ?? 0)} />
          <Text color="#B0B7C3" fontSize="xs">
            Collateral Utilization
          </Text>
        </Box>
      </>
    );
  }, [
    stats?.ovenBalance,
    stats?.outStandingCtez,
    stats?.maxMintableCtez,
    stats?.collateralUtilization,
    props.type,
    props.oven,
    textcolor,
  ]);

  const content = (
    <Grid
      gridTemplateColumns="repeat(5, 3fr) 4fr"
      my={6}
      py={4}
      px={10}
      borderRadius={16}
      backgroundColor={background}
      _hover={
        props.type === 'MyOvens'
          ? { boxShadow: '0 23px 66px 4px rgba(176, 183, 195, 0.25)', cursor: 'pointer' }
          : {}
      }
    >
      {renderedItems}
    </Grid>
  );

  if (props.type === 'MyOvens' && 'ovenId' in props.oven) {
    return <Link to={`/myovens/${props.oven.ovenId}`}>{content}</Link>;
  }

  return content;
};

export default OvenCard;
