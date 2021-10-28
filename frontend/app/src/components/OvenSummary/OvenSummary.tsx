import { Box, CSSObject, Flex, Grid, Text, useMediaQuery } from '@chakra-ui/react';
import React, { useMemo } from 'react';
import { AllOvenDatum } from '../../interfaces';
import { useOvenSummary, useThemeColors } from '../../hooks/utilHooks';
import { formatNumberStandard } from '../../utils/numbers';

interface IOvenCardProps {
  ovens: AllOvenDatum[];
}

const OvenSummary: React.FC<IOvenCardProps> = (props) => {
  const [background, textcolor] = useThemeColors(['cardbg', 'textcolor']);
  const { stats } = useOvenSummary(props.ovens);
  const [largerScreen] = useMediaQuery(['(min-width: 800px)']);

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
    const items = [
      {
        label: 'Total Balance',
        value: `${formatNumberStandard(stats?.totalBalance)} tez`,
        displayValue: `${formatNumberStandard(stats?.totalBalance)} tez`,
      },
      {
        label: 'Outstanding ',
        value: `${formatNumberStandard(stats?.totalOutstandingCtez)} ctez`,
        displayValue: `${formatNumberStandard(stats?.totalOutstandingCtez)} ctez`,
      },
      {
        label: 'Mintable ',
        value: `${formatNumberStandard(stats?.totalRemainingMintableCtez)} ctez`,
        displayValue: `${formatNumberStandard(stats?.totalRemainingMintableCtez)} ctez`,
      },
      {
        label: 'Withdrawable ',
        value: `${formatNumberStandard(stats?.totalWithdrawableTez)} tez`,
        displayValue: `${formatNumberStandard(stats?.totalWithdrawableTez)} tez`,
      },
    ]
      .filter((x): x is { label: string; value: string; displayValue: string } => !!x)
      .map((x, i) => ({ ...x, id: `oven-card-item-${i + 1}` }));

    return (
      <>
        <Box key="summaryTitle" id="summaryTitle">
          <Text fontWeight="600" fontSize="xl">
            Oven Summary
          </Text>
        </Box>
        {items.map((item) => (
          <Box key={item.id} id={item.id}>
            <Text fontWeight="500" color="#B0B7C3" fontSize="xs">
              {item.label}
            </Text>
            <Text color={textcolor} fontWeight="600">
              {item.value}
            </Text>
          </Box>
        ))}
      </>
    );
  }, [
    props.ovens,
    stats?.totalBalance,
    stats?.totalOutstandingCtez,
    stats?.totalRemainingMintableCtez,
    stats?.totalWithdrawableTez,
    textcolor,
  ]);

  const content = (
    <Flex
      direction="column"
      sx={cssSxValue.outerFlex}
      minW="340px"
      borderRadius={16}
      backgroundColor={background}
    >
      <Grid sx={cssSxValue.innerGrid}>{renderedItems}</Grid>
    </Flex>
  );

  return content;
};

export default OvenSummary;
