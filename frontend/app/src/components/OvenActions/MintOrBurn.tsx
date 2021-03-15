import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, InputAdornment, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { mintOrBurn, cTezError } from '../../contracts/ctez';
import { RootState } from '../../redux/rootReducer';
import FormikTextField from '../TextField';
import { CTezIcon } from '../CTezIcon/CTezIcon';

interface MintOrBurnProps {
  type: 'mint' | 'repay';
}

interface MintBurnForm {
  amount: number;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const MintOrBurn: React.FC<MintOrBurnProps> = ({ type }) => {
  const { t } = useTranslation(['common']);
  const { addToast } = useToasts();
  const ovenId = useSelector((state: RootState) => state.ovenActions.oven?.ovenId);
  const initialValues: MintBurnForm = {
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    amount: Yup.number().required(t('required')),
  });

  const handleFormSubmit = async (data: MintBurnForm) => {
    if (ovenId) {
      try {
        const amount = type === 'repay' ? -data.amount : data.amount;
        const result = await mintOrBurn(ovenId, amount);
        if (result) {
          addToast('Transaction Submitted', {
            appearance: 'success',
            autoDismiss: true,
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
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('amount')}
                    className="amount"
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
