import React from 'react';
import { Autocomplete as MaterialAutocomplete, TextField, TextFieldProps } from '@material-ui/core';
import { FieldProps } from 'formik';
import { Baker } from '../../interfaces';

export type FormikAutocompleteProps = FieldProps &
  TextFieldProps & {
    options: Baker[];
    handleChange?: (value: string) => void | Promise<void>;
  };
export const FormikAutocomplete: React.FC<FormikAutocompleteProps> = ({
  options = [],
  form: { setTouched, setFieldValue, touched, errors },
  field: { name },
  handleChange,
  ...rest
}) => {
  return (
    <MaterialAutocomplete
      freeSolo
      getOptionLabel={(option) => option.name ?? option.address}
      options={options}
      onChange={(_, value: any) => {
        const addr = value?.address ?? '';
        setFieldValue(name, addr);
        handleChange && handleChange(addr);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          {...rest}
          onChange={(e) => setFieldValue(name, e.target.value)}
          onBlur={() => setTouched({ [name]: true })}
          helperText={touched[name] ? errors[name] : ''}
          error={touched[name] && Boolean(errors[name])}
        />
      )}
    />
  );
};
