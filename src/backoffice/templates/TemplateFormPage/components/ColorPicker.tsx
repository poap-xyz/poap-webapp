import React, { FC, ReactNode } from 'react';
import { FormikValues, FormikActions } from 'formik';
import { TwitterPicker, ColorResult } from 'react-color';
import { Tooltip } from 'react-lightweight-tooltip';

// components
import { EventField } from 'backoffice/EventsPage';

type SetFieldValue = FormikActions<FormikValues>['setFieldValue'];

type Props = {
  title: string | ReactNode;
  name: string;
  setFieldValue: SetFieldValue;
  values: FormikValues;
};

export const ColorPicker: FC<Props> = ({ title, name, setFieldValue, values }) => {
  const handleChange = (color: ColorResult) => {
    setFieldValue(name, color.hex);
  };

  // Library typings are wrong, it asks for keys that are not necessary
  const colorPickerTooltipStyle: any = {
    tooltip: {
      backgroundColor: 'transparent',
      bottom: '70px',
    },
    arrow: {
      borderTop: 'none',
    },
    content: {
      backgroundColor: 'transparent',
    },
  };

  return (
    <Tooltip
      styles={colorPickerTooltipStyle}
      content={<TwitterPicker triangle="hide" color={values[name]} onChange={handleChange} />}
    >
      <div className="color-picker-container">
        <EventField name={name} title={title} />
        <div
          style={{
            backgroundColor: values[name],
            height: '30px',
            width: '30px',
            position: 'absolute',
            top: '38px',
            right: '12px',
            borderRadius: '4px',
          }}
        />
      </div>
    </Tooltip>
  );
};
