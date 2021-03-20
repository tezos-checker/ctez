import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, InputAdornment, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { mintOrBurn, cTezError } from '../../contracts/ctez';
import { RootState } from '../../redux/rootReducer';
import FormikTextField from '../TextField';
import { CTezIcon } from '../CTezIcon/CTezIcon';
import { getOvenMaxCtez } from '../../utils/ovenUtils';
import Typography from '../Typography';

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
  const oven = useSelector((state: RootState) => state.oven.oven);
  const { ovenId, tez_balance, ctez_outstanding } = oven || {
    ovenId: 0,
    tez_balance: '0',
    ctez_outstanding: '0',
  };
  const currentTarget = useSelector((state: RootState) => state.stats.baseStats?.originalTarget);
  const { max, remaining } = currentTarget
    ? getOvenMaxCtez(tez_balance, ctez_outstanding, currentTarget)
    : { max: 0, remaining: 0 };

  const outStandingCtez = new BigNumber(ctez_outstanding).shiftedBy(-6).toNumber() ?? 0;
  const maxMintableCtez = max < 0 ? 0 : max;
  const remainingMintableCtez = remaining < 0 ? 0 : remaining;
  const validationSchema = Yup.object().shape({
    amount: Yup.number().required(t('required')),
  });
  const initialValues: MintBurnForm = {
    amount: type === 'mint' ? remainingMintableCtez : 0,
  };

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
        enableReinitialize
      >
        {({ isSubmitting, isValid }) => (
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
                  <Typography size="body1" component="span" color="textSecondary">
                    {t('outstandingCTez')}: {outStandingCtez}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography size="body1" component="span" color="textSecondary">
                    {t('maxCtez')}: {maxMintableCtez}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography size="body1" component="span" color="textSecondary">
                    {t('mintableCtez')}: {remainingMintableCtez}
                  </Typography>
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('amountCtez')}
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
                    disabled={isSubmitting || !isValid}
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
