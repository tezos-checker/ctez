import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import styled from '@emotion/styled';
import { Field, Form, Formik } from 'formik';
import { Button, Grid, Paper } from '@material-ui/core';
import { useToasts } from 'react-toast-notifications';
import { editDepositor, cTezError } from '../../contracts/ctez';
import { EditDepositorOps } from '../../interfaces';
import { RootState } from '../../redux/rootReducer';
import { FormikRadioGroup } from '../FormikRadioGroup/FormikRadioGroup';
import { FormikTextField } from '../TextField';

interface EditDepositorForm {
  op: EditDepositorOps;
  enable: string;
  address: string;
}

const PaperStyled = styled(Paper)`
  padding: 2em;
`;

export const EditDepositor: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { addToast } = useToasts();
  const ovenAddress = useSelector((state: RootState) => state.oven.oven?.address);
  const initialValues: EditDepositorForm = {
    op: EditDepositorOps.AllowAccount,
    enable: 'true',
    address: '',
  };

  const opSelectionList = [
    {
      label: t(EditDepositorOps.AllowAny),
      value: EditDepositorOps.AllowAny,
    },
    {
      label: t(EditDepositorOps.AllowAccount),
      value: EditDepositorOps.AllowAccount,
    },
  ];

  const enableDisableList = [
    {
      label: t('allow'),
      value: 'true',
    },
    {
      label: t('deny'),
      value: 'false',
    },
  ];

  const validationSchema = Yup.object().shape({
    op: Yup.string()
      .oneOf([EditDepositorOps.AllowAny, EditDepositorOps.AllowAccount])
      .required(t('required')),
    enable: Yup.string().required(t('required')),
    address: Yup.string().when('op', {
      is: EditDepositorOps.AllowAccount,
      then: (addr) => addr.required(t('required')),
      otherwise: (addr) => addr.optional(),
    }),
  });

  const handleFormSubmit = async (data: EditDepositorForm) => {
    if (ovenAddress) {
      try {
        const result = await editDepositor(
          ovenAddress,
          data.op,
          data.enable === 'true',
          data.address,
        );
        if (result) {
          addToast(t('txSubmitted'), {
            appearance: 'success',
            autoDismiss: true,
          });
        }
      } catch (error) {
        const errorText = cTezError[error.data[1].with.int as number] || t('txFailed');
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
        {({ isSubmitting, isValid, dirty, values }) => (
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
                    component={FormikRadioGroup}
                    name="op"
                    id="op"
                    groupLabel={t('operation')}
                    options={opSelectionList}
                  />
                </Grid>
                <Grid item style={{ width: '40%' }}>
                  <Field
                    component={FormikRadioGroup}
                    name="enable"
                    id="enable"
                    groupLabel={t('action')}
                    options={enableDisableList}
                  />
                </Grid>
                <Grid item style={{ width: '40%' }}>
                  <Field
                    component={FormikTextField}
                    name="address"
                    id="address"
                    label={t('address')}
                    disabled={values.op === EditDepositorOps.AllowAny}
                    fullWidth
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
