import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, InputAdornment, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { cTezError, liquidate } from '../../contracts/ctez';
import FormikTextField from '../TextField';
import { useWallet } from '../../wallet/hooks';
import { RootState } from '../../redux/rootReducer';
import { CTezIcon } from '../CTezIcon/CTezIcon';

interface LiquidateForm {
  ovenOwner: string;
  amount: number;
  to: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const Liquidate: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const ovenId = useSelector((state: RootState) => state.oven.oven?.ovenId);
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
    if (ovenId) {
      try {
        const result = await liquidate(ovenId, data.ovenOwner, data.amount, data.to);
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
                <Grid item style={{ width: '40%' }}>
                  <Field
                    component={FormikTextField}
                    name="ovenOwner"
                    id="ovenOwner"
                    label={t('ovenOwner')}
                    className="ovenOwner"
                    fullWidth
                  />
                </Grid>
                <Grid item>
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
                    label={t('amount')}
                    className="amount"
                    type="number"
                    min="0.1"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CTezIcon height={20} width={20} />
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
