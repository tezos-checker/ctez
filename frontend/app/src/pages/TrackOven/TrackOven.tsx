import React from 'react';
import { validateContractAddress } from '@taquito/utils';
import * as Yup from 'yup';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { addExternalOven, getExternalOvens } from '../../utils/ovenUtils';
import { CTEZ_ADDRESS } from '../../utils/globals';
import { isOven } from '../../contracts/ctez';
import { useOvenData } from '../../api/queries';

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

interface AddOvenForm {
  ovenAddress: string;
}

const TrackOvenComponent: React.FC<WithTranslation> = ({ t }) => {
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();

  const initialValues: any = {
    ovenAddress: '',
  };

  const ovenData = useOvenData(userAddress);
  const prevOvens = ovenData.data?.map((o) => o.address) ?? [];

  const validationSchema = Yup.object().shape({
    ovenAddress: Yup.string()
      .test({
        test: (value) => validateContractAddress(value) === 3,
        message: t('invalidAddress'),
      })
      .test({
        test: (value) => typeof value !== 'undefined' && !prevOvens.includes(value),
        message: t('ovenAlreadyExits'),
      })
      .required(t('required')),
  });

  const handleFormSubmit = async (
    { ovenAddress }: AddOvenForm,
    formHelper: FormikHelpers<AddOvenForm>,
  ) => {
    const isValidAddress = await isOven(ovenAddress);
    if (!isValidAddress) {
      addToast(t('invalidOvenAddress'), {
        appearance: 'error',
        autoDismiss: true,
      });
    }
    if (userAddress && CTEZ_ADDRESS && isValidAddress) {
      addExternalOven(userAddress, CTEZ_ADDRESS, ovenAddress);
      if (!prevOvens.includes(ovenAddress)) {
        formHelper.resetForm();
        addToast(t('ovenAddedSuccess'), {
          appearance: 'success',
          autoDismiss: true,
        });
        history.push('/');
      }
    }
  };

  return (
    <Page title={t('trackOven')}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        validateOnMount
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
                <Grid item sx={{ minWidth: '51%' }}>
                  <Field
                    component={FormikTextField}
                    name="ovenAddress"
                    id="ovenAddress"
                    label={t('ovenAddress')}
                    className="ovenAddress"
                    type="text"
                    fullWidth
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

export const TrackOven = withTranslation(['common'])(TrackOvenComponent);
