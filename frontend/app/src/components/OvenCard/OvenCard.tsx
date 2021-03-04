import React from 'react';
import { Grid, Tooltip } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import {
  FcBusiness,
  FcMoneyTransfer,
  FcPrint,
  FcConferenceCall,
  FcBrokenLink,
} from 'react-icons/fc';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { useTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import { Link as RouterLink } from 'react-router-dom';
import { Oven } from '../../interfaces/ctez';
import Address from '../Address';
import Identicon from '../Identicon';
import { Typography } from '../Typography';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      maxWidth: 345,
    },
    media: {
      height: 0,
      paddingTop: '56.25%', // 16:9
    },
  }),
);

const getRandomInt = (max: number) => {
  return Math.floor(Math.floor(max) * Math.random()) + 1;
};

export const OvenCard: React.FC<Oven> = ({ address, baker, ctez_outstanding, tez_balance }) => {
  const classes = useStyles();
  const { t } = useTranslation(['common']);

  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={<Identicon seed={address} />}
        title="My Oven"
        subheader={<Address address={address} trimSize="medium" trim />}
      />
      <CardMedia
        className={classes.media}
        image={`/img/ovens/${getRandomInt(4)}.jpeg`}
        title="My Oven"
      />
      <CardContent>
        <Grid container direction="column">
          {baker && (
            <Grid item>
              <Typography size="caption" component="span" color="textSecondary">
                <Address label={t('baker')} address={baker} trim trimSize="medium" />
              </Typography>
            </Grid>
          )}
          <Grid item>
            <Typography size="caption" component="span" color="textSecondary">
              {t('ovenBalance')}: {tez_balance.shiftedBy(-6).toString()}
            </Typography>
          </Grid>
          <Grid item>
            <Typography size="caption" component="span" color="textSecondary">
              {t('outstandingCTez')}: {ctez_outstanding.shiftedBy(-6).toString()}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <Tooltip title={t('deposit').toString()}>
          <IconButton aria-label={t('deposit')} component={RouterLink} to="/deposit">
            <FcBusiness />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('withdraw').toString()}>
          <IconButton aria-label={t('withdraw')} component={RouterLink} to="/withdraw">
            <FcMoneyTransfer />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('mintOrBurn').toString()}>
          <IconButton aria-label={t('mintOrBurn')} component={RouterLink} to="/mint-or-burn">
            <FcPrint />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('delegate').toString()}>
          <IconButton aria-label={t('delegate')} component={RouterLink} to="/delegate">
            <FcConferenceCall />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('liquidate').toString()}>
          <IconButton aria-label={t('liquidate')} component={RouterLink} to="/liquidate">
            <FcBrokenLink />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};
