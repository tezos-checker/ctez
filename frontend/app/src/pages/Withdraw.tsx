import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { cTezError, withdraw } from '../contracts/ctez';
import FormikTextField from '../components/TextField';
import { useWallet } from '../wallet/hooks';
import { RootState } from '../redux/rootReducer';
import TezosIcon from '../components/TezosIcon';

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
  const history = useHistory();
  const ovenId = useSelector((state: RootState) => state.ovenActions.oven?.ovenId);
  const initialValues: WithdrawForm = {
    amount: 0,
    to: userAddress ?? '',
  };

  const validationSchema = Yup.object().shape({
    amount: Yup.number().min(0.1).required(t('required')),
    to: Yup.string().required(t('required')),
  });

  const handleFormSubmit = async (data: WithdrawForm) => {
    if (ovenId) {
      try {
        const result = await withdraw(ovenId, data.amount, data.to);
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
                  <Field component={FormikTextField} name="to" id="to" label={t('to')} fullWidth />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
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
