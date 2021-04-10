import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, InputAdornment, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { cTezError, deposit } from '../../contracts/ctez';
import FormikTextField from '../TextField';
import { RootState } from '../../redux/rootReducer';
import TezosIcon from '../TezosIcon';
import { logger } from '../../utils/logger';

interface DepositForm {
  amount: number;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const Deposit: React.FC = () => {
  const { addToast } = useToasts();
  const ovenAddress = useSelector((state: RootState) => state.oven.oven?.address);
  const { t } = useTranslation(['common']);
  const initialValues: any = {
    amount: '',
  };

  const validationSchema = Yup.object().shape({
    amount: Yup.number().min(0.000001).required(t('required')),
  });

  const handleFormSubmit = async (data: DepositForm) => {
    if (ovenAddress) {
      try {
        const result = await deposit(ovenAddress, data.amount);
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
          });
        }
      } catch (error) {
        logger.error(error);
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
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    placeholder="0.8"
                    label={t('amountXtz')}
                    className="amount"
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
