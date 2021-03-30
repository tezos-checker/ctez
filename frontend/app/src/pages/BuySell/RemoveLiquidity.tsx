import * as Yup from 'yup';
import { validateAddress } from '@taquito/utils';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { RemoveLiquidityParams } from '../../interfaces';
import { cfmmError, removeLiquidity } from '../../contracts/cfmm';
import { FormikDateTimePicker } from '../../components/DateTimePicker';
import { TezosIcon } from '../../components/TezosIcon';
import { CTezIcon } from '../../components/CTezIcon/CTezIcon';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

const RemoveLiquidityComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: RemoveLiquidityParams = {
    to: userAddress ?? '',
    lqtBurned: 1,
    minCashWithdrawn: 1,
    minTokensWithdrawn: 1,
    deadline: new Date(new Date().getTime() + 5 * 60000),
  };

  const validationSchema = Yup.object().shape({
    to: Yup.string()
      .test({
        test: (value) => validateAddress(value) === 3,
      })
      .required(t('required')),
    lqtBurned: Yup.number().required(t('required')),
    minCashWithdrawn: Yup.number().required(t('required')),
    minTokensWithdrawn: Yup.number().required(t('required')),
    deadline: Yup.date().required(t('required')),
  });

  const handleFormSubmit = async (data: RemoveLiquidityParams) => {
    if (userAddress) {
      try {
        const result = await removeLiquidity(data, userAddress);
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
            onDismiss: () => history.push('/'),
          });
        }
      } catch (error) {
        const errorText = cfmmError[error.data[1].with.int as number] || t('txFailed');
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <Page title={t('removeLiquidity')}>
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
                    name="lqtBurned"
                    id="lqtBurned"
                    label={t('lqtBurned')}
                    className="lqtBurned"
                    type="number"
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="minCashWithdrawn"
                    id="minCashWithdrawn"
                    label={t('minCashWithdrawn')}
                    className="minCashWithdrawn"
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
                    name="minTokensWithdrawn"
                    id="minTokensWithdrawn"
                    label={t('minTokensWithdrawn')}
                    className="minTokensWithdrawn"
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

export const RemoveLiquidityPage = withTranslation(['common'])(RemoveLiquidityComponent);
