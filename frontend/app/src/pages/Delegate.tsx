import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { getDelegates } from '../api/tzkt';
import { cTezError, delegate } from '../contracts/ctez';
import { FormikAutocomplete } from '../components/Autocomplete';
import { Baker } from '../interfaces';
import { RootState } from '../redux/rootReducer';

interface DelegateForm {
  delegate: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const Delegate: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { data: delegates } = useQuery<Baker[], AxiosError, Baker[]>(['delegates'], () => {
    return getDelegates();
  });
  const ovenAddress = useSelector((state: RootState) => state.ovenActions.oven?.address);
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: DelegateForm = {
    delegate: '',
  };

  const validationSchema = Yup.object().shape({
    delegate: Yup.string().required(t('required')),
  });

  const handleFormSubmit = async (data: DelegateForm) => {
    if (ovenAddress) {
      try {
        const result = await delegate(ovenAddress, data.delegate);
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
                <Grid item style={{ width: '100%' }}>
                  <Field
                    component={FormikAutocomplete}
                    name="delegate"
                    id="delegate"
                    label={t('delegate')}
                    placeholder={t('delegatePlaceholder')}
                    options={delegates}
                    className="delegate"
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
