import { FieldProps } from 'formik';
import React from 'react';
import Select, { OptionsType, ValueType } from 'react-select';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps extends FieldProps {
  options: OptionsType<Option>;
  placeholder: string
}

const colourStyles = {
  control: (styles: any) => ({
    ...styles,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#eef0fb',
    '&:hover': { borderColor: '#6534ff' },
  }),
  input: (styles: any) => ({ ...styles, height: 36 })
};

const FormSelect = ({field, form, options, placeholder}: CustomSelectProps) => {
  const onChange = (option: ValueType<Option | Option[]>) => {
    form.setFieldValue(field.name, (option as Option).value );
  };

  const getValue = () => {
    if (options) {
      return options.find(option => option.value === field.value);
    } else {
      return ('' as any);
    }
  };

  return (
    <Select
      name={field.name}
      value={getValue()}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={"rselect"}
      styles={colourStyles}
    />
  );
};

export default FormSelect;
