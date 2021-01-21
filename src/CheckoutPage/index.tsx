import React, { FC } from 'react';

/* UI Components */
import { ScanFooter, ScanHeader } from '../ScanPage';

/* Hooks */

/* Helpers */

const CheckoutPage: FC = () => {
  return (
    <div className="checkout-page">
      <ScanHeader sectionName="" />
      <main id="site-main" role="main" className="app-content">
        <div className="container">
          <h1>A new generation of checkouts</h1>
        </div>
      </main>
      <ScanFooter path="home" />
    </div>
  );
};

export default CheckoutPage;
