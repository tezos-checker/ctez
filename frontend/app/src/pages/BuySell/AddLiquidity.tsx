import React, { useState } from 'react';
import * as Yup from 'yup';
import { addMinutes } from 'date-fns';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment, Typography } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { AddLiquidityParams, CfmmStorage } from '../../interfaces';
import { addLiquidity, cfmmError, getCfmmStorage } from '../../contracts/cfmm';
import { TezosIcon } from '../../components/TezosIcon';
import { logger } from '../../utils/logger';
import { DEFAULT_SLIPPAGE } from '../../utils/globals';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

interface AddLiquidityForm {
  amount: number;
  slippage: number;
  deadline: number;
}

const AddLiquidityComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const [maxTokens, setMaxToken] = useState(0);
  const [minPoolPercent, setMinPoolPercent] = useState(0);
  const [minLQT, setMinLQT] = useState(0);
  const history = useHistory();
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

  const calcMaxToken = (slippage: number, cashDeposited: number) => {
    if (cfmmStorage) {
      const { tokenPool, cashPool } = cfmmStorage;
      const cash = cashDeposited * 1e6;
      const max =
        Math.ceil(((cash * tokenPool.toNumber()) / cashPool.toNumber()) * (1 + slippage * 0.01)) /
        1e6;
      setMaxToken(Number(max.toFixed(6)));
    } else {
      setMaxToken(-1);
    }
  };

  const calcMinPoolPercent = (slippage: number, cashDeposited: number) => {
    if (cfmmStorage) {
      const { cashPool, lqtTotal } = cfmmStorage;
      const cash = cashDeposited * 1e6;
      const minLQTMinted =
        ((cash * lqtTotal.toNumber()) / cashPool.toNumber()) * (1 - slippage * 0.01);
      const minPool = (minLQTMinted / (lqtTotal.toNumber() + minLQTMinted)) * 100;
      setMinLQT(Number((minLQTMinted / 1e6).toFixed()));
      setMinPoolPercent(Number(minPool.toFixed(6)));
    } else {
      setMinPoolPercent(-1);
    }
  };

  const initialValues: AddLiquidityForm = {
    slippage: DEFAULT_SLIPPAGE,
    deadline: 20,
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    slippage: Yup.number().min(0).optional(),
    deadline: Yup.number().min(0).optional(),
    amount: Yup.number().required(t('required')),
  });

  const handleFormSubmit = async (formData: AddLiquidityForm) => {
    if (userAddress) {
      try {
        const deadline = addMinutes(new Date(), formData.deadline);
        const data: AddLiquidityParams = {
          deadline,
          amount: formData.amount,
          owner: userAddress,
          maxTokensDeposited: maxTokens,
          minLqtMinted: minLQT,
        };
        const result = await addLiquidity(data);
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
            onDismiss: () => history.push('/'),
          });
        }
      } catch (error) {
        logger.error(error);
        const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <Page title={t('addLiquidity')}>
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
                <Grid item sx={{ minWidth: '37%' }}>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('xtzToDeposit')}
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
                      calcMaxToken(0, Number(e.target.value));
                      calcMinPoolPercent(0, Number(e.target.value));
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
                      calcMaxToken(Number(e.target.value), amount);
                      calcMinPoolPercent(Number(e.target.value), amount);
                    }}
                  />
                </Grid>
                {maxTokens > -1 && (
                  <Grid item>
                    <Typography>{`${t('maxCtezDeposited')}: ${maxTokens}`}</Typography>
                  </Grid>
                )}
                {minPoolPercent > -1 && (
                  <Grid item>
                    <Typography>{`${t('minLqtPoolShare')}: ${minPoolPercent}%`}</Typography>
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

export const AddLiquidityPage = withTranslation(['common'])(AddLiquidityComponent);
