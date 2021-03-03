import React from 'react';

/* Types */
type CheckoutSuccessProps = {
  qr: string;
};

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ qr }) => {
  return (
    <div className={'checkout-success'}>
      <div className={'title'}>Welcome back!</div>
      <p>Find below the link to your previous claim</p>
      <div className={'link'}>
        <a href={`/claim/${qr}`}>app.poap.xyz/claim/{qr}</a>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
