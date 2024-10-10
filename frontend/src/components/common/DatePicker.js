import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePicker = ({ startDate, endDate, onChange }) => {
  return (
    <ReactDatePicker
      selectsRange={true}
      startDate={startDate}
      endDate={endDate}
      onChange={onChange}
      className="form-input px-4 py-2 rounded-md"
    />
  );
};

export default DatePicker;