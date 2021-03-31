import React from 'react';
import { validateAddress } from '@taquito/utils';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { cTezError, withdraw } from '../../contracts/ctez';
import { RootState } from '../../redux/rootReducer';
import { useWallet } from '../../wallet/hooks';
import FormikTextField from '../TextField';
import { TezosIcon } from '../TezosIcon';

interface WithdrawForm {
  amount: number;
  to: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const Withdraw: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const ovenId = useSelector((state: RootState) => state.oven.oven?.ovenId);
  const initialValues: any = {
    amount: '',
    to: userAddress ?? '',
  };

  const validationSchema = Yup.object().shape({
    amount: Yup.number().min(0.1).required(t('required')),
    to: Yup.string()
      .test({
        test: (value) => validateAddress(value) === 3,
        message: t('invalidAddress'),
      })
      .required(t('required')),
  });

  const handleFormSubmit = async (data: WithdrawForm) => {
    if (ovenId) {
      try {
        const result = await withdraw(ovenId, data.amount, data.to);
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
          });
        }
      } catch (error) {
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting, isValid, dirty }) => (
          <PaperStyled>
            <Form>
              <Grid
                container
                spacing={3}
                direction="column"
                alignContent="center"
                justifyContent="center"
              >
                <Grid item style={{ width: '40%' }}>
                  <Field component={FormikTextField} name="to" id="to" label={t('to')} fullWidth />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    placeholder="0.8"
                    id="amount"
                    label={t('amountXtz')}
                    className="amount"
                    type="number"
                    min="0.1"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TezosIcon height={30} width={30} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting || !isValid || !dirty}
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
    </div>
  );
};
