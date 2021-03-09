import { withTranslation, WithTranslation } from 'react-i18next';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { getDelegates } from '../api/tzkt';
import { create, cTezError } from '../contracts/ctez';
import Page from '../components/Page';
import { FormikAutocomplete } from '../components/Autocomplete';
import { Baker } from '../interfaces';
import { useWallet } from '../wallet/hooks';

interface CreateVaultForm {
  delegate: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

const CreateVaultComponent: React.FC<WithTranslation> = ({ t }) => {
  const { data: delegates } = useQuery<Baker[], AxiosError, Baker[]>(['delegates'], () => {
    return getDelegates();
  });
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: CreateVaultForm = {
    delegate: '',
  };

  const validationSchema = Yup.object().shape({
    delegate: Yup.string().required(t('required')),
  });

  const handleFormSubmit = async (data: CreateVaultForm) => {
    if (userAddress) {
      try {
        const result = await create(userAddress, data.delegate);
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
    }
  };

  return (
    <Page title={t('createVault')}>
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
                <Grid item style={{ width: '100%' }}>
                  <Field
                    component={FormikAutocomplete}
                    name="delegate"
                    id="delegate"
                    label={t('delegate')}
                    placeholder={t('delegatePlaceholder')}
                    options={delegates}
                    className="delegate"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!userAddress || isSubmitting || !isValid || !dirty}
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

export const CreateVaultPage = withTranslation(['common'])(CreateVaultComponent);
