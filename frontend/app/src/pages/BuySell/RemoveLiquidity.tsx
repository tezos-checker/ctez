import { useState } from 'react';
import * as Yup from 'yup';
import { addMinutes } from 'date-fns';
import { validateAddress } from '@taquito/utils';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import {
  Button,
  Grid,
  Paper,
  InputAdornment,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { RemoveLiquidityParams } from '../../interfaces';
import { cfmmError, removeLiquidity } from '../../contracts/cfmm';
import { DEFAULT_SLIPPAGE } from '../../utils/globals';
import { useCfmmStorage } from '../../api/queries';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

interface RemoveLiquidityForm {
  to: string;
  deadline: number;
  lqtBurned: number;
  slippage: number;
}

const RemoveLiquidityComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const [values, setValues] = useState({
    cashWithdraw: 0,
    tokenWithdraw: 0,
  });
  const { addToast } = useToasts();
  const history = useHistory();
  const { data: cfmmStorage } = useCfmmStorage();

  const calcMinValues = (slippage: number, lqtBurned: number) => {
    if (cfmmStorage) {
      const { cashPool, tokenPool, lqtTotal } = cfmmStorage;
      const cashWithdraw =
        ((lqtBurned * cashPool.toNumber()) / lqtTotal.toNumber()) * (1 - slippage * 0.01);
      const tokenWithdraw =
        ((lqtBurned * tokenPool.toNumber()) / lqtTotal.toNumber()) * (1 - slippage * 0.01);
      setValues({
        cashWithdraw: Number((cashWithdraw / 1e6).toFixed(6)),
        tokenWithdraw: Number((tokenWithdraw / 1e6).toFixed(6)),
      });
    }
  };

  const initialValues: any = {
    to: userAddress ?? '',
    lqtBurned: '',
    deadline: 20,
    slippage: DEFAULT_SLIPPAGE,
  };

  const validationSchema = Yup.object().shape({
    to: Yup.string()
      .test({
        test: (value) => validateAddress(value) === 3,
      })
      .required(t('required')),
    lqtBurned: Yup.number()
      .min(1, `${t('shouldMinimum')} 1`)
      .positive(t('shouldPositive'))
      .integer(t('shouldInteger'))
      .required(t('required')),
    deadline: Yup.number().min(0).optional(),
    slippage: Yup.number().min(0).optional(),
  });

  const handleFormSubmit = async (formData: RemoveLiquidityForm) => {
    if (userAddress) {
      try {
        const deadline = addMinutes(new Date(), formData.deadline);
        const data: RemoveLiquidityParams = {
          deadline,
          to: formData.to,
          lqtBurned: formData.lqtBurned,
          minCashWithdrawn: values.cashWithdraw,
          minTokensWithdrawn: values.tokenWithdraw,
        };
        const result = await removeLiquidity(data, userAddress);
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
            onDismiss: () => history.push('/'),
          });
        }
      } catch (error) {
        const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <Page title={t('removeLiquidity')}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validateOnMount
      >
        {({ isSubmitting, isValid, values: formValues }) => (
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
                    name="lqtBurned"
                    id="lqtBurned"
                    label={t('lqtBurned')}
                    className="lqtBurned"
                    type="number"
                    placeholder="1"
                    fullWidth
                    handleChange={(
                      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
                    ) => {
                      const { slippage } = formValues;
                      calcMinValues(slippage, Number(e.target.value));
                    }}
                  />
                </Grid>
                <Grid item>
                  <Typography>{`${t('minCashWithdrawn')}: ${values.cashWithdraw}`}</Typography>
                </Grid>
                <Grid item>
                  <Typography>{`${t('minTokensWithdrawn')}: ${values.tokenWithdraw}`}</Typography>
                </Grid>
                <Grid item>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {t('advanceOptions')}
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid
                        container
                        spacing={4}
                        direction="column"
                        alignContent="center"
                        justifyContent="center"
                      >
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
                              const { lqtBurned } = formValues;
                              calcMinValues(Number(e.target.value), lqtBurned);
                            }}
                          />
                        </Grid>

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
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
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

export const RemoveLiquidityPage = withTranslation(['common'])(RemoveLiquidityComponent);
