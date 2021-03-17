import * as React from 'react';
import styled from '@emotion/styled';
import { Card, CardContent } from '@material-ui/core';
import { Typography } from '../Typography/Typography';

const StyledCard = styled(Card)`
  min-width: 10rem;
  max-width: 15rem;
  min-height: 7.2rem;
  max-height: 7.2rem;
`;

interface StatsCardProps {
  label: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, children }) => {
  return (
    <StyledCard>
      <CardContent>
        <Typography size="h6" component="div" textAlign="center" whiteSpace="nowrap">
          {label}
        </Typography>
        {children}
      </CardContent>
    </StyledCard>
  );
};
