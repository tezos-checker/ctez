import * as React from 'react';
import styled from '@emotion/styled';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Typography } from '../Typography/Typography';

const StyledCard = styled(Card)`
  min-width: 10rem;
  max-width: 15rem;
`;

interface StatsCardProps {
  label: string;
  value: string | number;
  isPercentage?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, isPercentage }) => {
  const val = isPercentage ? `${value}%` : value;
  return (
    <StyledCard>
      <CardContent>
        <Typography size="h6" component="div" textAlign="center">
          {label}
        </Typography>
        <Typography size="subtitle1" component="p" textAlign="center">
          {val}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};
