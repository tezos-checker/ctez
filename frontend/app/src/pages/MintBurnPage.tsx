import { withTranslation, WithTranslation } from 'react-i18next';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { cTezError, mintOrBurn } from '../contracts/ctez';
import Page from '../components/Page';
import FormikTextField from '../components/TextField';

interface MintBurnForm {
  amount: number;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
  & .amount {
    min-width: 40rem;
  }
`;

const MintBurnComponent: React.FC<WithTranslation> = ({ t }) => {
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: MintBurnForm = {
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    amount: Yup.number().min(1).required(t('required')),
  });

  const handleFormSubmit = async (data: MintBurnForm) => {
    try {
      const result = await mintOrBurn(data.amount);
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
    <Page title={t('mintOrBurn')}>
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
                    label={t('amount')}
                    className="amount"
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

export const MintBurnPage = withTranslation(['common'])(MintBurnComponent);