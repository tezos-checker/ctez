import * as Yup from 'yup';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { AddLiquidityParams } from '../../interfaces';
import { addLiquidity, cfmmError } from '../../contracts/cfmm';
import { FormikDateTimePicker } from '../../components/DateTimePicker';
import { TezosIcon } from '../../components/TezosIcon';
import { CTezIcon } from '../../components/CTezIcon/CTezIcon';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

const AddLiquidityComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: AddLiquidityParams = {
    owner: userAddress ?? '',
    maxTokensDeposited: 0,
    minLqtMinted: 0,
    deadline: new Date(new Date().getTime() + 5 * 60000),
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    owner: Yup.string().required(t('required')),
    maxTokensDeposited: Yup.number().required(t('required')),
    minLqtMinted: Yup.number().required(t('required')),
    deadline: Yup.date().required(t('required')),
    amount: Yup.number().required(t('required')),
  });

  const handleFormSubmit = async (data: AddLiquidityParams) => {
    if (userAddress) {
      try {
        const result = await addLiquidity(data, userAddress);
        if (result) {
          addToast('Transaction Submitted', {
            appearance: 'success',
            autoDismiss: true,
            onDismiss: () => history.push('/'),
          });
        }
      } catch (error) {
        console.log(error);
        const errorText = cfmmError[error.data[1].with.int as number] || 'Transaction Failed';
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <Page title={t('addLiquidity')}>
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
                    name="owner"
                    id="owner"
                    label={t('owner')}
                    className="owner"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="maxTokensDeposited"
                    id="maxTokensDeposited"
                    label={t('maxTokensDeposited')}
                    className="maxTokensDeposited"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CTezIcon height={30} width={30} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('xtzToDeposit')}
                    className="amount"
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
                    name="minLqtMinted"
                    id="minLqtMinted"
                    label={t('minLqtMinted')}
                    className="minLqtMinted"
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

export const AddLiquidityPage = withTranslation(['common'])(AddLiquidityComponent);
