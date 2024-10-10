import React from 'react';

const ErrorMessage = ({ message }) => {
  let errorContent;

  if (typeof message === 'string') {
    errorContent = message;
  } else if (typeof message === 'object') {
    errorContent = JSON.stringify(message, null, 2);
  } else {
    errorContent = 'An unknown error occurred';
  }

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{errorContent}</span>
    </div>
  );
};

export default ErrorMessage;