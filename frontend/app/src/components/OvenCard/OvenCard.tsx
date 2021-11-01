import {
  Box,
  CSSObject,
  Flex,
  Grid,
  Icon,
  Spacer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import React, { MouseEventHandler, useMemo, MouseEvent as ReactMouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HiDownload } from 'react-icons/hi';
import { MdDelete } from 'react-icons/md';
import { AllOvenDatum } from '../../interfaces';
import ProgressPill from './ProgressPill';
import { useOvenStats, useThemeColors } from '../../hooks/utilHooks';
import CopyAddress from '../CopyAddress/CopyAddress';
import { useCtezBaseStats } from '../../api/queries';
import { isMonthFromLiquidation } from '../../api/contracts';
import SkeletonLayout from '../skeleton';
import { trimAddress } from '../../utils/addressUtils';
import { formatNumberStandard } from '../../utils/numbers';
import { useAppDispatch } from '../../redux/store';
import { setRemoveOven } from '../../redux/slices/OvenSlice';

interface IOvenCardProps {
  type: 'AllOvens' | 'MyOvens';
  oven: AllOvenDatum;
}

const OvenCard: React.FC<IOvenCardProps> = (props) => {
  const [background, textcolor, imported, text4] = useThemeColors([
    'cardbg',
    'textColor',
    'imported',
    'text4',
  ]);
  const { t } = useTranslation(['common']);
  const { stats } = useOvenStats(props.oven);
  const { data } = useCtezBaseStats();
  const dispatch = useAppDispatch();

  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);
  const removeTrackedOven = (address: string, e: ReactMouseEvent<SVGElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(setRemoveOven(address));
  };

  const result = useMemo(
    () =>
      isMonthFromLiquidation(
        Number(stats?.outStandingCtez),
        Number(data?.currentTarget),
        Number(stats?.ovenBalance ?? 0),
        Number(data?.currentAnnualDrift),
        true,
      ),
    [data?.currentAnnualDrift, data?.currentTarget, stats?.outStandingCtez, stats?.ovenBalance],
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

  const removeIcon = useMemo(() => {
    return (
      <Icon
        as={MdDelete}
        color={textcolor}
        fontSize="lg"
        onClick={
          ((e) =>
            removeTrackedOven(
              props.oven.value.address,
              e,
            ) as unknown) as MouseEventHandler<SVGElement>
        }
      />
    );
  }, []);

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
      { label: t('ovenAddress'), value: address, displayValue: trimAddress(address) },
      props.type === 'AllOvens' && {
        label: t('owner'),
        value: owner,
        displayValue: trimAddress(owner),
      },
      {
        label: t('ovenBalance'),
        value: `${formatNumberStandard(stats?.ovenBalance)} tez`,
        displayValue: `${formatNumberStandard(stats?.ovenBalance)} tez`,
      },
      {
        label: t('outstanding'),
        value: `${formatNumberStandard(stats?.outStandingCtez)} ctez`,
        displayValue: `${formatNumberStandard(stats?.outStandingCtez)} ctez`,
      },
      {
        label: t('mintable'),
        value: `${formatNumberStandard(stats?.maxMintableCtez)} ctez`,
        displayValue: `${formatNumberStandard(stats?.maxMintableCtez)} ctez`,
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
            <Text fontWeight="500" color={text4} fontSize="xs">
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
          <Text color={text4} fontSize="xs">
            {t('collateralUtilization')}
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
    <div>
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
          <Flex>
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
            <Spacer />
            {removeIcon}
          </Flex>
        )}

        <Grid sx={cssSxValue.innerGrid}>{renderedItems}</Grid>
      </Flex>
    </div>
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
