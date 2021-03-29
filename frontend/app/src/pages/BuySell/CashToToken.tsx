import { useState } from 'react';
import * as Yup from 'yup';
import { addMinutes } from 'date-fns';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { useQuery } from 'react-query';
import { AxiosError } from 'axios';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment, Typography } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { CfmmStorage } from '../../interfaces';
import { cashToToken, cfmmError, getCfmmStorage } from '../../contracts/cfmm';
import { TezosIcon } from '../../components/TezosIcon';
import { logger } from '../../utils/logger';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

interface CashToTokenForm {
  to: string;
  slippage: number;
  deadline: number;
  amount: number;
}

const CashToTokenComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const [minTokens, setMinTokens] = useState(0);
  const { data: cfmmStorage } = useQuery<CfmmStorage, AxiosError, CfmmStorage>(
    ['cfmmStorage'],
    async () => {
      return getCfmmStorage();
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );

  const calcMinTokens = (slippage: number, cashSold: number): number => {
    if (cfmmStorage) {
      const { tokenPool, cashPool } = cfmmStorage;
      const tok =
        ((cashSold * 997 * tokenPool.toNumber()) / (cashPool.toNumber() * 1000 + cashSold * 997)) *
        (1 - slippage);
      return Number(tok.toFixed(6));
    }
    return -1;
  };

  const initialValues: CashToTokenForm = {
    to: userAddress ?? '',
    slippage: 0,
    deadline: 20,
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    to: Yup.string().required(t('required')),
    slippage: Yup.number().optional(),
    deadline: Yup.number().min(0).required(t('required')),
    amount: Yup.number().required(t('required')),
  });

  const handleFormSubmit = async (formData: CashToTokenForm) => {
    try {
      const deadline = addMinutes(new Date(), formData.deadline);
      const result = await cashToToken({
        amount: formData.amount,
        deadline,
        minTokensBought: minTokens,
        to: formData.to,
      });
      if (result) {
        addToast('Transaction Submitted', {
          appearance: 'success',
          autoDismiss: true,
          onDismiss: () => history.push('/'),
        });
      }
    } catch (error) {
      logger.warn(error);
      const errorText = cfmmError[error.data[1].with.int as number] || 'Transaction Failed';
      addToast(errorText, {
        appearance: 'error',
        autoDismiss: true,
      });
    }
  };

  return (
    <Page title={t('cashToToken')}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting, isValid, values }) => (
          <PaperStyled>
            <Form>
              <Grid
                container
                spacing={4}
                direction="column"
                alignContent="center"
                justifyContent="center"
              >
                <Grid item sx={{ minWidth: '41%' }}>
                  <Field
                    component={FormikTextField}
                    name="to"
                    id="to"
                    label={t('to')}
                    className="to"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('xtzToPay')}
                    className="amount"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TezosIcon height={30} width={30} />
                        </InputAdornment>
                      ),
                    }}
                    handleChange={(
                      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
                    ) => {
                      const { slippage } = values;
                      const min = calcMinTokens(slippage, Number(e.target.value));
                      setMinTokens(min);
                    }}
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="slippage"
                    id="slippage"
                    label={t('slippage')}
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography>%</Typography>
                        </InputAdornment>
                      ),
                    }}
                    handleChange={(
                      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
                    ) => {
                      const { amount } = values;
                      const min = calcMinTokens(Number(e.target.value), amount);
                      setMinTokens(min);
                    }}
                  />
                </Grid>
                {minTokens > -1 && (
                  <Grid item>
                    <Typography>
                      {t('minCtezBought')}: {minTokens}
                    </Typography>
                  </Grid>
                )}
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="deadline"
                    id="deadline"
                    label={t('transactionTimeout')}
                    className="deadline"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography>{t('minutes')}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting || !isValid || !userAddress}
                    fullWidth
                  >
                    {t('submit')}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          </PaperStyled>
        )}
      </Formik>
    </Page>
  );
};

export const CashToTokenPage = withTranslation(['common'])(CashToTokenComponent);
