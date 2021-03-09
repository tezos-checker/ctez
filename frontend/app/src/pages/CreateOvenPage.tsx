import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper, InputAdornment } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';
import { getDelegates } from '../api/tzkt';
import { create, cTezError } from '../contracts/ctez';
import Page from '../components/Page';
import { FormikAutocomplete } from '../components/Autocomplete';
import { Baker } from '../interfaces';
import { useWallet } from '../wallet/hooks';
import FormikTextField from '../components/TextField';
import { TezosIcon } from '../components/TezosIcon';

interface CreateVaultForm {
  delegate: string;
  amount: number;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

const CreateOvenComponent: React.FC<WithTranslation> = ({ t }) => {
  const { data: delegates } = useQuery<Baker[], AxiosError, Baker[]>(['delegates'], () => {
    return getDelegates();
  });
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const history = useHistory();
  const initialValues: CreateVaultForm = {
    delegate: '',
    amount: 0,
  };

  const validationSchema = Yup.object().shape({
    delegate: Yup.string().required(t('required')),
    amount: Yup.number().optional(),
  });

  const handleFormSubmit = async (data: CreateVaultForm) => {
    if (userAddress) {
      try {
        const result = await create(userAddress, data.delegate, (data.amount = 0));
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
    <Page title={t('header:createOven')}>
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
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Field
                    component={FormikTextField}
                    name="amount"
                    id="amount"
                    label={t('initialDeposit')}
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
                    disabled={!userAddress || isSubmitting || !isValid || !dirty}
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

export const CreateOvenPage = withTranslation(['common', 'header'])(CreateOvenComponent);
