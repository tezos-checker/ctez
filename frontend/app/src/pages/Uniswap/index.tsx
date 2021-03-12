import {
  makeStyles,
  Theme,
  createStyles,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';

export const Uniswap: React.FC = () => {
  const { t } = useTranslation(['common', 'header']);
  const history = useHistory();

  const useStyles = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        width: '100%',
        paddingTop: '4rem',
      },
      heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
      },
    }),
  );
  const classes = useStyles();

  return (
    <Page title={t('header:buyOrSell')}>
      <div className={classes.root}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>CFMM Methods</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography onClick={() => history.push('/add-liquidity')}>
              {t('addLiquidity')}
            </Typography>
          </AccordionDetails>
          <AccordionDetails>
            <Typography onClick={() => history.push('/remove-liquidity')}>
              {t('removeLiquidity')}
            </Typography>
          </AccordionDetails>
          <AccordionDetails>
            <Typography onClick={() => history.push('/cash-to-token')}>
              {t('cashToToken')}
            </Typography>
          </AccordionDetails>
          <AccordionDetails>
            <Typography onClick={() => history.push('/token-to-cash')}>
              {t('tokenToCash')}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>
    </Page>
  );
};
