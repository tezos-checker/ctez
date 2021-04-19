import { useTranslation } from 'react-i18next';
import { validateAddress } from '@taquito/utils';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { cTezError, delegate } from '../../contracts/ctez';
import { FormikAutocomplete } from '../Autocomplete';
import { RootState } from '../../redux/rootReducer';
import { useDelegates } from '../../api/queries';
import { useWallet } from '../../wallet/hooks';

interface DelegateForm {
  delegate: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const Delegate: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { data: delegates } = useDelegates(userAddress);
  const ovenAddress = useSelector((state: RootState) => state.oven.oven?.address);
  const { addToast } = useToasts();
  const initialValues: DelegateForm = {
    delegate: '',
  };

  const validationSchema = Yup.object().shape({
    delegate: Yup.string()
      .test({
        test: (value) => validateAddress(value) === 3,
        message: t('invalidAddress'),
      })
      .required(t('required')),
  });

  const handleFormSubmit = async (data: DelegateForm) => {
    if (ovenAddress) {
      try {
        const result = await delegate(ovenAddress, data.delegate);
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
