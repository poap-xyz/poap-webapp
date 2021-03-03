import React from 'react';

/* Types */
type CheckoutMessageProps = {
  message: string;
};

const CheckoutMessage: React.FC<CheckoutMessageProps> = ({ message }) => {
  return (
    <div className={'checkout-message'}>
      {message}
    </div>
  );
};

export default CheckoutMessage;
