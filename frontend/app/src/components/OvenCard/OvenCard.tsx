import {
  Box,
  CSSObject,
  Flex,
  Grid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HiDownload } from 'react-icons/hi';
import { AllOvenDatum } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { useOvenStats } from '../../hooks/utilHooks';
import CopyAddress from '../CopyAddress/CopyAddress';
import { useCtezBaseStats } from '../../api/queries';
import { isMonthFromLiquidation } from '../../api/contracts';
import SkeletonLayout from '../skeleton';
import { trimAddress } from '../../utils/addressUtils';

interface IOvenCardProps {
  type: 'AllOvens' | 'MyOvens';
  oven: AllOvenDatum;
}

const OvenCard: React.FC<IOvenCardProps> = (props) => {
  const background = useColorModeValue('white', 'cardbgdark');
  const textcolor = useColorModeValue('text2', 'white');
  const imported = useColorModeValue('blue', 'white');
  const { stats } = useOvenStats(props.oven);
  const { data } = useCtezBaseStats();
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const result = isMonthFromLiquidation(
    Number(stats?.outStandingCtez),
    Number(data?.currentTarget),
    Number(stats?.ovenBalance ?? 0),
    Number(data?.currentAnnualDrift),
  );

  // ? Used for changing layout between Mobile and Desktop view
  const cssSxValue: { outerFlex: CSSObject; innerGrid: CSSObject } = useMemo(() => {
    if (largerScreen) {
      return {
        outerFlex: {
          my: 6,
          py: 4,
          px: 10,
        },
        innerGrid: {
          gridTemplateColumns: 'repeat(5, 3fr) 4fr',
        },
      };
    }

    const getBorderStyles = (position: ('Bottom' | 'Right')[]) => {
      return {
        borderColor: 'gray.200',
        borderStyle: 'solid',
        ...position.reduce((acc, cur) => ({ ...acc, [`border${cur}Width`]: `1px` }), {}),
      };
    };

    return {
      outerFlex: {
        my: 6,
        py: 2,
        px: 6,
      },
      innerGrid: {
        gridTemplateColumns: `repeat(6, 1fr)`,
        gridTemplateRows: `repeat(3, 1fr)`,

        '& > div': {
          p: 4,
        },

        '& > #oven-card-item-1': {
          gridArea: `1 / 1 / 2 / 4`,
          ...getBorderStyles(['Bottom', 'Right']),
        },
        '& > #oven-card-item-2': {
          gridArea: `1 / 4 / 2 / 7`,
          ...getBorderStyles(['Bottom']),
        },
        '& > #oven-card-item-3': {
          gridArea: `2 / 1 / 3 / 3`,
          ...getBorderStyles(['Bottom', 'Right']),
        },
        '& > #oven-card-item-4': {
          gridArea: `2 / 3 / 3 / 5`,
          ...getBorderStyles(['Bottom', 'Right']),
        },
        '& > #oven-card-item-5': {
          gridArea: `2 / 5 / 3 / 7`,
          ...getBorderStyles(['Bottom']),
        },
        '& > #oven-card-item-6': {
          gridArea: `3 / 1 / 4 / 7`,
        },
      },
    };
  }, [largerScreen]);

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
          displayValue: trimAddress(owner),
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
      { label: 'Oven address', value: address, displayValue: trimAddress(address) },
      props.type === 'AllOvens' && {
        label: 'Owner',
        value: owner,
        displayValue: trimAddress(owner),
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
    ]
      .filter((x): x is { label: string; value: string; displayValue: string } => !!x)
      .map((x, i) => ({ ...x, id: `oven-card-item-${i + 1}` }));

    return (
      <>
        {items.map((item) => (
          <Box key={item.id} id={item.id}>
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
        <Box id="oven-card-item-6">
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
    props.oven,
    stats?.ovenBalance,
    stats?.outStandingCtez,
    stats?.maxMintableCtez,
    stats?.collateralUtilization,
    result,
    textcolor,
  ]);

  const content = (
    <Flex
      direction="column"
      sx={cssSxValue.outerFlex}
      minW="340px"
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
      <Grid sx={cssSxValue.innerGrid}>{renderedItems}</Grid>
    </Flex>
  );

  if (stats?.collateralUtilization === 'Infinity') {
    return <SkeletonLayout count={1} component="OvenCard" />;
  }

  if (props.type === 'MyOvens') {
    return <Link to={`/myovens/${props.oven.value.address}`}>{content}</Link>;
  }

  return content;
};

export default OvenCard;
