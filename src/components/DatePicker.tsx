import React from 'react';
import { ErrorMessage } from 'formik';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { RangeModifier } from '../backoffice/EventsPage';
import 'react-day-picker/lib/style.css';

export type SetFieldValue = (field: string, value: any) => void;
export type DatePickerDay = 'start_date' | 'end_date';
type DatePickerContainerProps = {
  text: string;
  dayToSetup: DatePickerDay;
  handleDayClick: (day: Date, dayToSetup: DatePickerDay, setFieldValue: SetFieldValue) => void;
  setFieldValue: SetFieldValue;
  disabledDays: RangeModifier | undefined;
  placeholder?: string;
  disabled: boolean;
  value: string | Date;
};

const DatePicker = ({
  text,
  dayToSetup,
  handleDayClick,
  setFieldValue,
  placeholder,
  disabledDays,
  disabled,
  value,
}: DatePickerContainerProps) => {
  const handleDayChange = (day: Date) => handleDayClick(day, dayToSetup, setFieldValue);
  let _value = value;
  if (value instanceof Date) {
    const offset = new Date().getTimezoneOffset();
    const offsetSign = offset < 0 ? -1 : 1;
    _value = new Date(value.valueOf() + offset * 60 * 1000 * offsetSign);
  }
  return (
    <div className={`date-picker-container ${dayToSetup === 'end_date' ? 'end-date-overlay' : ''}`}>
      <label>{text}</label>
      <DayPickerInput
        placeholder={placeholder}
        dayPickerProps={{ disabledDays }}
        onDayChange={handleDayChange}
        value={_value}
        inputProps={{ readOnly: 'readonly', disabled: disabled }}
      />
      <ErrorMessage name={dayToSetup} component="p" className="bk-error" />
    </div>
  );
};

export default DatePicker;
