import {
  Box,
  Flex,
  Grid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HiDownload } from 'react-icons/hi';
import { AllOvenDatum } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { useOvenStats } from '../../hooks/utilHooks';
import CopyAddress from '../CopyAddress/CopyAddress';
import { useCtezBaseStats, useUserBalance } from '../../api/queries';
import { isMonthFromLiquidation } from '../../api/contracts';
import { useWallet } from '../../wallet/hooks';

interface IOvenCardProps {
  type: 'AllOvens' | 'MyOvens';
  oven: AllOvenDatum;
}

const truncateText = (text: string | null) => {
  if (text == null) {
    return '';
  }

  const len = text.length;
  return `${text.substr(0, 5)}...${text.substr(len - 5)}`;
};

const OvenCard: React.FC<IOvenCardProps> = (props) => {
  const [{ pkh: userAddress }] = useWallet();
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const imported = useColorModeValue('blue', 'white');
  const { stats } = useOvenStats(props.oven);
  const { data } = useCtezBaseStats();
  const result = isMonthFromLiquidation(
    Number(stats?.outStandingCtez),
    Number(data?.currentTarget),
    Number(stats?.ovenBalance ?? 0),
    Number(data?.currentAnnualDrift),
  );

  const renderedItems = useMemo(() => {
    const { address, owner, id } = (() => {
      return {
        address: props.oven.value.address,
        owner: props.oven.key.owner,
        id: props.oven.key.id,
      };
    })();

    const firstItem = () => {
      if (props.oven.isImported) {
        return {
          label: 'Owner',
          value: owner,
          displayValue: truncateText(owner),
        };
      }

      return {
        label: 'ID',
        value: `#${id}`,
        displayValue: `#${id}`,
      };
    };

    const items = [
      props.type === 'MyOvens' && firstItem(),
      { label: 'Oven address', value: address, displayValue: truncateText(address) },
      props.type === 'AllOvens' && {
        label: 'Owner',
        value: owner,
        displayValue: truncateText(owner),
      },
      {
        label: 'Oven Balance',
        value: `${stats?.ovenBalance ?? 0} tez`,
        displayValue: `${stats?.ovenBalance ?? 0} tez`,
      },
      {
        label: 'Outstanding ',
        value: `${stats?.outStandingCtez ?? 0} ctez`,
        displayValue: `${stats?.outStandingCtez ?? 0} ctez`,
      },
      {
        label: 'Mintable ',
        value: `${stats?.maxMintableCtez} ctez`,
        displayValue: `${stats?.maxMintableCtez} ctez`,
      },
    ].filter((x): x is { label: string; value: string; displayValue: string } => !!x);

    return (
      <>
        {items.map((item) => (
          <Box key={item.label}>
            {item.label === 'Oven address' || item.label === 'Owner' ? (
              <Text as="span" color={textcolor} fontWeight="600">
                <CopyAddress address={item.value}>{item.displayValue}</CopyAddress>
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
          <ProgressPill
            value={Number(stats?.collateralUtilization ?? 0)}
            type={props.type}
            oven={props.oven}
            warning={result}
          />
          <Text color="#B0B7C3" fontSize="xs">
            Collateral Utilization
          </Text>
        </Box>
      </>
    );
  }, [
    props.type,
    props.oven.value.address,
    props.oven.key.owner,
    props.oven.key.id,
    props.oven.isImported,
    stats?.ovenBalance,
    stats?.outStandingCtez,
    stats?.maxMintableCtez,
    stats?.collateralUtilization,
    textcolor,
  ]);

  const content = (
    <Flex
      direction="column"
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
      {props.oven.isImported && (
        <Tag
          variant="outline"
          color={imported}
          borderColor={imported}
          mb={2}
          w="100px"
          borderRadius="24px"
        >
          <TagLeftIcon boxSize="12px" as={HiDownload} />
          <TagLabel>Imported</TagLabel>
        </Tag>
      )}
      <Grid gridTemplateColumns="repeat(5, 3fr) 4fr">{renderedItems}</Grid>
    </Flex>
  );

  if (props.type === 'MyOvens') {
    return <Link to={`/myovens/${props.oven.key.id}/${props.oven.value.address}`}>{content}</Link>;
  }

  return content;
};

export default OvenCard;
