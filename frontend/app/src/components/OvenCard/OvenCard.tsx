import React from 'react';
import styled from '@emotion/styled';
import { Avatar, Box, Button, Chip, Grid, Skeleton } from '@material-ui/core';
import { FcImport, FcExport } from 'react-icons/fc';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useTranslation } from 'react-i18next';
import { Oven } from '../../interfaces/ctez';
import Address from '../Address';
import Identicon from '../Identicon';
import { Typography } from '../Typography';

interface OvenCardProps extends Oven {
  imageId: number;
  maxCtez: number;
  isMonthAway?: boolean;
  isExternal?: boolean;
  isImported?: boolean;
  action?: () => void | Promise<void>;
  removeExternalAction?: () => void | Promise<void>;
  isLoading?: boolean;
}

export const StyledCard = styled(Card)`
  max-width: 20rem;
  min-width: 20rem;
  margin-left: 3rem;
  border-radius: 1rem;
  &.with-border {
    border-color: rgba(242, 36, 19, 1);
    border-style: solid;
    border-width: 0.13rem;
  }
`;

export const StyledCardMedia = styled(CardMedia)`
  height: 0;
  padding-top: 12rem;
`;

const OvenCardComponent: React.FC<OvenCardProps> = ({
  address,
  baker,
  ctez_outstanding,
  tez_balance,
  imageId,
  action,
  maxCtez,
  isMonthAway = false,
  isExternal = false,
  isImported = false,
  removeExternalAction,
  isLoading,
}) => {
  const { t } = useTranslation(['common']);
  const maxMintableCtez = maxCtez < 0 ? 0 : maxCtez;
  const outStandingCtez = ctez_outstanding?.shiftedBy(-6).toNumber() ?? 0;
  const ovenBalance = tez_balance?.shiftedBy(-6).toNumber() ?? 0;
  return (
    <StyledCard className={isMonthAway ? 'with-border' : undefined}>
      <CardHeader
        avatar={
          isLoading ? (
            <Skeleton variant="circular">
              <Avatar variant="circular" />
            </Skeleton>
          ) : (
            <Box>
              <Identicon seed={address} type="tzKtCat" />
            </Box>
          )
        }
        title={
          isLoading ? (
            <Skeleton variant="text" animation="pulse" />
          ) : (
            <Address address={address} trimSize="medium" trim />
          )
        }
        subheader={
          <Grid container direction="column">
            <Grid item>
              <Typography size="body1" component="span" color="textSecondary">
                {isLoading ? <Skeleton /> : `${t('ovenBalance')}: ${ovenBalance}`}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                variant="outlined"
                size="small"
                icon={<FcExport />}
                label={
                  <Typography size="caption" component="span" color="textSecondary">
                    {t('external')}
                  </Typography>
                }
                sx={{ visibility: isExternal ? 'visible' : 'hidden' }}
              />
              <Chip
                variant="outlined"
                size="small"
                icon={<FcImport />}
                label={
                  <Typography size="caption" component="span" color="textSecondary">
                    {t('imported')}
                  </Typography>
                }
                sx={{ visibility: isImported ? 'visible' : 'hidden', marginLeft: '0.4rem' }}
                onDelete={removeExternalAction}
              />
            </Grid>
          </Grid>
        }
      />
      {isLoading ? (
        <Skeleton variant="rectangular" width="20rem" height="14.375rem" />
      ) : (
        <StyledCardMedia image={`/img/ovens/${imageId}.jpeg`} />
      )}
      <CardContent>
        <Grid container direction="column">
          {baker && (
            <Grid item>
              <Typography size="body1" component="span" color="textSecondary">
                <Address label={t('baker')} address={baker} trim trimSize="medium" />
              </Typography>
            </Grid>
          )}
          <Grid item>
            <Typography size="body1" component="span" color="textSecondary">
              {isLoading ? <Skeleton /> : `${t('outstandingCTez')} : ${outStandingCtez}`}
            </Typography>
          </Grid>
          {maxMintableCtez > 0 && (
            <Grid item>
              <Typography size="body1" component="span" color="textSecondary">
                {isLoading ? (
                  <Skeleton />
                ) : (
                  `${t('currentUtilization')} : ${(
                    (outStandingCtez / maxMintableCtez) *
                    100
                  ).toFixed(2)}%`
                )}
                {isMonthAway && (
                  <span role="img" aria-label="alert">
                    ⚠️
                  </span>
                )}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <Button
          onClick={action}
          disableRipple
          disableFocusRipple
          endIcon={<ExpandMoreIcon color="action" />}
          disabled={isLoading}
        >
          <Typography size="caption" color="CaptionText">
            {t('actions')}
          </Typography>
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export const OvenCard = React.memo(OvenCardComponent);
