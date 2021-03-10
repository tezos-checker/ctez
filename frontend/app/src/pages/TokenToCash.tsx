import { withTranslation, WithTranslation } from 'react-i18next';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../components/Page';
import FormikTextField from '../components/TextField';
import { useWallet } from '../wallet/hooks';
import { TokenToCashParams } from '../interfaces';
import { cfmmError, tokenToCash } from '../contracts/cfmm';
import { FormikDateTimePicker } from '../components/DateTimePicker';
import { TezosIcon } from '../components/TezosIcon';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

const TokenToCashComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: TokenToCashParams = {
    to: userAddress ?? '',
    minCashBought: 0,
    tokensSold: 0,
    deadline: new Date(),
  };

  const validationSchema = Yup.object().shape({
    to: Yup.string().required(t('required')),
    minCashBought: Yup.number().required(t('required')),
    deadline: Yup.date().required(t('required')),
    tokensSold: Yup.number().required(t('required')),
  });

  const handleFormSubmit = async (data: TokenToCashParams) => {
    try {
      const result = await tokenToCash(data);
      if (result) {
        addToast('Transaction Submitted', {
          appearance: 'success',
          autoDismiss: true,
          onDismiss: () => history.push('/'),
        });
      }
    } catch (error) {
      const errorText = cfmmError[error.data[1].with.int as number] || 'Transaction Failed';
      addToast(errorText, {
        appearance: 'error',
        autoDismiss: true,
      });
    }
  };

  return (
    <Page title={t('tokenToCash')}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting, isValid }) => (
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
                    name="minCashBought"
                    id="minCashBought"
                    label={t('minXTZBought')}
                    className="minCashBought"
                    type="number"
                    fullWidth
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
                  <Field
                    component={FormikTextField}
                    name="tokensSold"
                    id="tokensSold"
                    label={t('tokensSold')}
                    className="tokensSold"
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikDateTimePicker}
                    name="deadline"
                    id="deadline"
                    label={t('deadline')}
                    inputFormat="dd/MM/yyyy HH:mm"
                    className="deadline"
                    type="number"
                    disablePast
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

export const TokenToCashPage = withTranslation(['common'])(TokenToCashComponent);
