import * as React from 'react';
import styled from '@emotion/styled';
import { Card, CardContent } from '@material-ui/core';
import { Typography } from '../Typography/Typography';

const StyledCard = styled(Card)`
  min-width: 10rem;
  max-width: 15rem;
`;

interface StatsCardProps {
  label: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, children }) => {
  return (
    <StyledCard>
      <CardContent>
        <Typography size="h6" component="div" textAlign="center">
          {label}
        </Typography>
        {children}
      </CardContent>
    </StyledCard>
  );
};
