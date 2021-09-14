import { useState } from 'react';
import { validateAddress } from '@taquito/utils';
import * as Yup from 'yup';
import { addMinutes } from 'date-fns';
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
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { tezToCash, cfmmError, cashToTez } from '../../contracts/cfmm';
import { TezosIcon } from '../../components/TezosIcon';
import { CTezIcon } from '../../components/CTezIcon/CTezIcon';
import { logger } from '../../utils/logger';
import { DEFAULT_SLIPPAGE } from '../../utils/globals';
import { useCfmmStorage } from '../../api/queries';

interface ConversionParams extends WithTranslation {
  formType: 'tezToCtez' | 'ctezToTez';
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

interface ConversionFormParams {
  to: string;
  slippage: number;
  deadline: number;
  amount: number;
}

const FEE = 9995;
const FEE_DENOM = 10000;

const newtonDxToDyRecursive = (
  xp: number,
  xp2: number,
  x3yPlusY3x: number,
  y: number,
  dyApprox: number,
  rounds: number,
): number => {
  if (rounds <= 0) return dyApprox;
  const yp = y - dyApprox;
  const yp2 = Math.abs(yp * yp);
  const num = Math.abs(xp * yp * (xp2 + yp2) - x3yPlusY3x);
  const denom = xp * (xp2 + 3 * yp2);
  const adjust = num / denom;
  const newDyApprox = dyApprox + adjust;
  return newtonDxToDyRecursive(xp, xp2, x3yPlusY3x, y, newDyApprox, rounds - 1);
};

const newtonDxToDy = (x: number, y: number, dx: number, rounds: number): number => {
  const xp = x + dx;
  const xp2 = xp * xp;
  const x3yPlusY3x = x * y * (x * x + y * y);
  return newtonDxToDyRecursive(xp, xp2, x3yPlusY3x, y, 0, rounds);
};

const tradeDTezForDCash = (
  tez: number,
  cash: number,
  dtez: number,
  target: number,
  rounds = 4,
): number => {
  const x = tez * 2 ** 48;
  const y = target * cash;
  const dx = dtez * 2 ** 48;
  const dyApprox = newtonDxToDy(x, y, dx, rounds);
  const dCashApprox = dyApprox / target;
  if (tez - dCashApprox <= 0) {
    throw new Error('CASH POOL MINUS CASH WITHDRAWN IS NEGATIVE');
  }
  return dCashApprox;
};

const tradeDCashForDTez = (
  tez: number,
  cash: number,
  dcash: number,
  target: number,
  rounds = 4,
): number => {
  const y = tez * 2 ** 48;
  const x = target * cash;
  const dx = target * dcash;
  const dyApprox = newtonDxToDy(x, y, dx, rounds);
  const dtezApprox = dyApprox / 2 ** 48;
  if (tez - dtezApprox <= 0) {
    throw new Error('TEZ POOL MINUS TEZ WITHDRAWN IS NEGATIVE');
  }
  return dtezApprox;
};

const ConvertComponent: React.FC<ConversionParams> = ({ t, formType }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const [minBuyValue, setMinBuyValue] = useState(0);
  const [minWithoutSlippage, setWithoutSlippage] = useState(0);
  const { data: cfmmStorage } = useCfmmStorage();

  const calcMinBuyValue = (slippage: number, amount: number) => {
    if (cfmmStorage) {
      const { tezPool, cashPool, target } = cfmmStorage;
      const cashSold = amount * 1e6;
      console.log(tezPool.toNumber(), cashPool.toNumber(), cashSold, 65536);
      const bought =
        formType === 'tezToCtez'
          ? tradeDTezForDCash(
              tezPool.toNumber(),
              cashPool.toNumber(),
              cashSold,
              target.toNumber(),
              4,
            )
          : tradeDCashForDTez(
              tezPool.toNumber(),
              cashPool.toNumber(),
              cashSold,
              target.toNumber(),
              4,
            );

      const boughtAfterFee = (bought * FEE) / FEE_DENOM;
      console.log(bought, boughtAfterFee);
      const tok = boughtAfterFee * (1 - slippage * 0.01);
      console.log(boughtAfterFee);
      setWithoutSlippage(Number((Math.floor(boughtAfterFee) / 1e6).toFixed(6)));
      setMinBuyValue(Number((Math.floor(tok) / 1e6).toFixed(6)));
    } else {
      setMinBuyValue(-1);
    }
  };

  const initialValues: ConversionFormParams = {
    to: userAddress ?? '',
    slippage: DEFAULT_SLIPPAGE,
    deadline: 20,
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    to: Yup.string()
      .test({
        test: (value) => validateAddress(value) === 3,
      })
      .required(t('required')),
    slippage: Yup.number().min(0).optional(),
    deadline: Yup.number().min(0).required(t('required')),
    amount: Yup.number()
      .min(0.000001, `${t('shouldMinimum')} 0.000001`)
      .positive(t('shouldPositive'))
      .required(t('required')),
  });

  const handleFormSubmit = async (formData: ConversionFormParams) => {
    try {
      const deadline = addMinutes(new Date(), formData.deadline);
      const result =
        formType === 'tezToCtez'
          ? await tezToCash({
              amount: formData.amount,
              deadline,
              minTokensBought: minBuyValue,
              to: formData.to,
            })
          : await cashToTez(
              {
                deadline,
                minCashBought: minBuyValue,
                to: formData.to,
                tokensSold: formData.amount,
              },
              userAddress!,
            );
      if (result) {
        addToast(t('txSubmitted'), {
          appearance: 'success',
          autoDismiss: true,
          onDismiss: () => history.push('/'),
        });
      }
    } catch (error) {
      logger.warn(error);
      const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
      addToast(errorText, {
        appearance: 'error',
        autoDismiss: true,
      });
    }
  };

  return (
    <Page title={t(formType)}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validateOnMount
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
                    label={t(formType === 'tezToCtez' ? 'xtzToPay' : 'ctezToPay')}
                    className="amount"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {formType === 'tezToCtez' ? (
                            <TezosIcon height={30} width={30} />
                          ) : (
                            <CTezIcon height={30} width={30} />
                          )}
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {' '}
                          ≈
                          {formType === 'tezToCtez' ? (
                            <>
                              <CTezIcon height={30} width={30} />
                              {minWithoutSlippage}
                            </>
                          ) : (
                            <>
                              <TezosIcon height={30} width={30} />
                              {minWithoutSlippage}
                            </>
                          )}
                        </InputAdornment>
                      ),
                    }}
                    handleChange={(
                      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
                    ) => {
                      const { slippage } = values;
                      calcMinBuyValue(slippage, Number(e.target.value));
                    }}
                  />
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
                              const { amount } = values;
                              calcMinBuyValue(Number(e.target.value), amount);
                            }}
                          />
                        </Grid>
                        {minBuyValue > -1 && (
                          <Grid item>
                            <Typography>
                              {`${t(
                                formType === 'tezToCtez' ? 'minCtezBought' : 'minTezBought',
                              )}: ${minBuyValue}`}
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

export const ConversionPage = withTranslation(['common'])(ConvertComponent);
