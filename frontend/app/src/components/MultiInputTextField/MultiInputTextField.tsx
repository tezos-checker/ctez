import { useEffect, useState } from 'react';
import { FieldProps } from 'formik';
import { Autocomplete, AutocompleteRenderGetTagProps, Chip, TextField } from '@material-ui/core';
import Identicon from '../Identicon';
import { trimAddress } from '../../utils/addressUtils';

export type MultiInputTextFieldOption = {
  value: string;
  label?: string;
  noDelete?: boolean;
};

interface MultiInputTextFieldProps {
  disabled?: boolean;
  defaultValue?: MultiInputTextFieldOption[];
  isAddressField?: boolean;
  handleChange?: (value: any) => void | Promise<void>;
}

export type FormikMultiTextFieldProps = MultiInputTextFieldProps & FieldProps;

const getOptionLabel = (option: MultiInputTextFieldOption, isAddress = false) => {
  let value = option.value ?? option;
  value = isAddress ? trimAddress(value, 'small') : value;
  if (option.label && value) {
    return `${value} (${option.label})`;
  }
  if (option.label && !value) {
    return option.label;
  }
  if (!option.label && value) {
    return value;
  }
  return '--';
};

const renderAddressTag = (
  value: MultiInputTextFieldOption[],
  getTagProps: AutocompleteRenderGetTagProps,
) =>
  value.map((option, index) => {
    const { onDelete, ...rest } = getTagProps({ index });
    const handleDelete = option.noDelete ? undefined : onDelete;
    return (
      <Chip
        variant="outlined"
        label={getOptionLabel(option, true)}
        onDelete={handleDelete}
        {...rest}
        avatar={<Identicon seed={option.value ?? option} type="tzKtCat" />}
        key={option?.value ?? option}
      />
    );
  });

export const MultiInputTextField: React.FC<FormikMultiTextFieldProps> = ({
  form: { touched, errors, setFieldValue },
  field: { name, value },
  defaultValue,
  isAddressField,
  disabled,
  handleChange,
  ...rest
}) => {
  const renderTags = isAddressField ? renderAddressTag : undefined;
  const [innerDefaultVal, setDefaultVal] = useState(defaultValue);
  useEffect(() => {
    setDefaultVal(defaultValue);
  }, [defaultValue]);
  return (
    <Autocomplete
      multiple
      options={[]}
      getOptionLabel={getOptionLabel}
      defaultValue={innerDefaultVal}
      value={value}
      freeSolo
      disableClearable
      renderTags={renderTags}
      disabled={disabled}
      onChange={(_, v: any) => {
        setFieldValue(name, v);
        handleChange && handleChange(v);
      }}
      renderInput={(params: any) => (
        <TextField
          disabled={disabled}
          {...params}
          {...rest}
          helperText={touched[name] ? errors[name] : ''}
          error={touched[name] && Boolean(errors[name])}
        />
      )}
    />
  );
};
