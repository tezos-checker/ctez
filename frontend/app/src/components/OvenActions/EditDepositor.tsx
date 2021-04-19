import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { validateAddress } from '@taquito/utils';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { cTezError, addRemoveDepositorList, enableDisableAnyDepositor } from '../../contracts/ctez';
import { RootState } from '../../redux/rootReducer';
import { useOvenDelegate, useOvenStorage } from '../../api/queries';
import {
  MultiInputTextField,
  MultiInputTextFieldOption,
} from '../MultiInputTextField/MultiInputTextField';
import { useWallet } from '../../wallet/hooks';
import { logger } from '../../utils/logger';

type DepositorList = MultiInputTextFieldOption[];
interface EditDepositorForm {
  depositors: string[] | DepositorList;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const EditDepositor: React.FC = () => {
  const { t } = useTranslation(['common']);
  const [{ pkh: userAddress }] = useWallet();
  const { addToast } = useToasts();
  const ovenAddress = useSelector((state: RootState) => state.oven.oven?.address);
  const { data: ovenData } = useOvenStorage(ovenAddress);
  const { data: delegate } = useOvenDelegate(ovenAddress);
  const [depositors, setDepositors] = useState<DepositorList>([]);
  const isAny =
    ovenData &&
    !Array.isArray(ovenData.depositors) &&
    Object.keys(ovenData.depositors).includes('any');

  useEffect(() => {
    const newList: DepositorList = [];
    if (userAddress) {
      newList.push({
        value: userAddress,
        label: 'You',
        noDelete: true,
      });
    }
    if (ovenData) {
      if (!isAny && Array.isArray(ovenData.depositors)) {
        let ovenDepositors = [...ovenData.depositors];
        if (delegate && ovenData.depositors.includes(delegate)) {
          newList.push({
            value: delegate,
            label: 'Delegate',
            noDelete: true,
          });
          ovenDepositors = ovenData.depositors.filter((o) => o !== userAddress);
        }
        newList.push(...ovenDepositors.map((addr) => ({ value: addr })));
      }
      setDepositors(newList);
    }
  }, [ovenData, delegate, userAddress]);
  const initialValues: EditDepositorForm = {
    depositors,
  };

  const validationSchema = Yup.object().shape({
    depositors: Yup.array()
      .test({
        test: (value) => {
          return (
            value?.reduce((acc, item: any) => {
              return acc && validateAddress(item?.value ?? item) === 3;
            }, true) ?? false
          );
        },
      })
      .required(t('required')),
  });

  const handleAllowAnyone = async () => {
    if (ovenAddress && userAddress) {
      try {
        const result = await enableDisableAnyDepositor(ovenAddress, true);
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
          });
        }
      } catch (error) {
        logger.error(error);
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  const handleFormSubmit = async (data: EditDepositorForm) => {
    if (ovenAddress && ovenData && userAddress) {
      try {
        const userWhiteList = data.depositors
          .map((item: any) => item?.value ?? item)
          .filter((o) => o !== userAddress);
        const userDenyList = !isAny
          ? (ovenData.depositors as string[]).filter((o) => !userWhiteList.includes(o))
          : undefined;
        const result = await addRemoveDepositorList(
          ovenAddress,
          ovenData,
          userWhiteList,
          userDenyList,
        );
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
          });
        }
      } catch (error) {
        logger.error(error);
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
        addToast(errorText, {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <PaperStyled>
      <Grid container spacing={3} direction="column" alignContent="center" justifyContent="center">
        <Grid item style={{ width: '100%' }}>
          <Button variant="contained" fullWidth disabled={isAny} onClick={handleAllowAnyone}>
            {t(isAny ? 'everyoneAllowed' : 'allowEveryone')}
          </Button>
        </Grid>
        <Grid item>
          <Divider>{t('or')}</Divider>
        </Grid>
        <Grid item>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form>
                <Grid
                  container
                  spacing={3}
                  direction="column"
                  alignContent="center"
                  justifyContent="center"
                >
                  <Grid item>
                    <Typography>{t('useWhiteList')}</Typography>
                  </Grid>
                  <Grid item style={{ width: '100%' }}>
                    <Field
                      component={MultiInputTextField}
                      id="depositors"
                      name="depositors"
                      placeholder="e.g. tz3d1ZjAkd9zCGMoRTMYNaeZhFurS65U2U1J"
                      label={t('allowedDepositors')}
                      isAddressField
                      defaultValue={depositors}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isSubmitting || !isValid}
                      fullWidth
                    >
                      {t('updateWhitelist')}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Grid>
      </Grid>
    </PaperStyled>
  );
};
