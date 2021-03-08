import React from 'react';
import { Button, Collapse, Grid, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
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

const TOTAL_OVEN_IMG = 5;

interface OvenCardProps extends Oven {
  ovenId: number;
  totalOvens: number;
  action?: () => void | Promise<void>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 500,
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

const scaleBetween = (
  unscaledNum: number,
  minAllowed: number,
  maxAllowed: number,
  min: number,
  max: number,
): number => {
  const num = Math.ceil(
    ((maxAllowed - minAllowed) * (unscaledNum - min)) / (max - min) + minAllowed,
  );
  if (num % 1 === 0) return num;
  return scaleBetween(num, minAllowed, maxAllowed, min, max);
};

export const OvenCard: React.FC<OvenCardProps> = ({
  address,
  baker,
  ctez_outstanding,
  tez_balance,
  ovenId,
  totalOvens,
  action,
}) => {
  const classes = useStyles();
  const { t } = useTranslation(['common']);
  const [expanded, setExpanded] = React.useState(false);
  const imageSelected =
    ovenId > TOTAL_OVEN_IMG ? scaleBetween(ovenId, 1, 5, 6, totalOvens) : ovenId;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={<Identicon seed={address} />}
        title="My Oven"
        subheader={<Address address={address} trimSize="large" trim />}
      />
      <CardMedia
        className={classes.media}
        image={`/img/ovens/${imageSelected}.jpeg`}
        title="My Oven"
      />
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
              {t('ovenBalance')}: {tez_balance.shiftedBy(-6).toString()}
            </Typography>
          </Grid>
          <Grid item>
            <Typography size="body1" component="span" color="textSecondary">
              {t('outstandingCTez')}: {ctez_outstanding.shiftedBy(-6).toString()}
            </Typography>
          </Grid>
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
            Actions
          </Typography>
        </Button>
      </CardActions>
    </Card>
  );
};
