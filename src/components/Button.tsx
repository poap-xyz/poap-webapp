import React from 'react';

export const Button: React.FC<{
  text: string;
  action: () => void;
  extraClass: string;
}> = ({ text, action, extraClass }) => (
  <button className={`btn ${extraClass}`} onClick={action}>
    {text}
  </button>
);
