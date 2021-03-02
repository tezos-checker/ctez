import { withTranslation, WithTranslation } from 'react-i18next';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { cTezError, liquidate, withdraw } from '../contracts/ctez';
import Page from '../components/Page';
import FormikTextField from '../components/TextField';
import { useWallet } from '../wallet/hooks';

interface LiquidateForm {
  ovenOwner: string;
  amount: number;
  to: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
  & .to,
  .ovenOwner {
    min-width: 40rem;
  }
`;

const LiquidateComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: LiquidateForm = {
    ovenOwner: userAddress ?? '',
    amount: 0,
    to: userAddress ?? '',
  };

  const validationSchema = Yup.object().shape({
    ovenOwner: Yup.string().required(t('required')),
    amount: Yup.number().min(0.1).required(t('required')),
    to: Yup.string().required(t('required')),
  });

  const handleFormSubmit = async (data: LiquidateForm) => {
    try {
      const result = await liquidate(data.ovenOwner, data.amount, data.to);
      if (result) {
        addToast('Transaction Submitted', {
          appearance: 'success',
          autoDismiss: true,
          onDismiss: () => history.push('/'),
        });
      }
    } catch (error) {
      const errorText = cTezError[error.data[1].with.int as number] || 'Transaction Failed';
      addToast(errorText, {
        appearance: 'error',
        autoDismiss: true,
      });
    }
  };

  return (
    <Page title={t('liquidate')}>
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
                    name="ovenOwner"
                    id="ovenOwner"
                    label={t('ovenOwner')}
                    className="ovenOwner"
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="to"
                    id="to"
                    label={t('to')}
                    className="to"
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('amount')}
                    className="amount"
                    type="number"
                    min="0.1"
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
    </Page>
  );
};

export const LiquidatePage = withTranslation(['common'])(LiquidateComponent);
