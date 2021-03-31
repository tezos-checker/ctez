import React from 'react';
import { validateContractAddress } from '@taquito/utils';
import * as Yup from 'yup';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import Page from '../../components/Page';
import FormikTextField from '../../components/TextField';
import { useWallet } from '../../wallet/hooks';
import { addExternalOven, getExternalOvens } from '../../utils/ovenUtils';
import { CTEZ_ADDRESS } from '../../utils/globals';

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

  const prevOvens = userAddress && CTEZ_ADDRESS ? getExternalOvens(userAddress, CTEZ_ADDRESS) : [];

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

  const handleFormSubmit = async ({ ovenAddress }: AddOvenForm) => {
    if (userAddress && CTEZ_ADDRESS) {
      addExternalOven(userAddress, CTEZ_ADDRESS, ovenAddress);
      if (!prevOvens.includes(ovenAddress)) {
        addToast(t('ovenAddedSuccess'), {
          appearance: 'success',
          autoDismiss: true,
          onDismiss: () => history.push('/'),
        });
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
        {({ isSubmitting, isValid, values }) => (
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
