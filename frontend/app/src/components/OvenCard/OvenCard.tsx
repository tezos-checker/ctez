import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
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
  action?: () => void | Promise<void>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '20rem',
      marginLeft: '3rem',
      [theme.breakpoints.down('sm')]: {
        marginLeft: '1.5rem',
      },
    },
    media: {
      height: 0,
      paddingTop: '12rem',
    },
  }),
);

export const OvenCard: React.FC<OvenCardProps> = ({
  address,
  baker,
  ctez_outstanding,
  tez_balance,
  imageId,
  action,
  maxCtez,
  isMonthAway = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation(['common']);
  const maxMintableCtez = maxCtez < 0 ? 0 : maxCtez;
  const outStandingCtez = ctez_outstanding?.shiftedBy(-6).toNumber() ?? 0;
  const ovenBalance = tez_balance?.shiftedBy(-6).toNumber() ?? 0;
  const circleColor = !isMonthAway ? '#028004' : 'secondary.main';
  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Box borderColor={circleColor} border={2} borderRadius="50%" color={circleColor}>
            <Identicon seed={address} type="tzKtCat" />
          </Box>
        }
        title={<Address address={address} trimSize="medium" trim />}
        subheader={`${t('ovenBalance')}: ${ovenBalance}`}
      />
      <CardMedia className={classes.media} image={`/img/ovens/${imageId}.jpeg`} title="My Oven" />
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
              {t('outstandingCTez')}: {outStandingCtez}
            </Typography>
          </Grid>
          {maxMintableCtez > 0 && (
            <Grid item>
              <Typography size="body1" component="span" color="textSecondary">
                {t('currentUtilization')}: {((outStandingCtez / maxMintableCtez) * 100).toFixed(2)}%
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions disableSpacing>
        <Button
          onClick={() => {
            action && action();
          }}
          disableRipple
          disableFocusRipple
          endIcon={<ExpandMoreIcon color="action" />}
        >
          <Typography size="caption" color="CaptionText">
            {t('actions')}
          </Typography>
        </Button>
      </CardActions>
    </Card>
  );
};
