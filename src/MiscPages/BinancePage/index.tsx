import React, { FC } from 'react';

/* UI Components */
import { ScanFooter, ScanHeader } from '../../ScanPage';

/* Hooks */

/* Helpers */

const BinancePage: FC = () => {

  return (
    <div className="binance-page">
      <ScanHeader sectionName="" />
      <main id="site-main" role="main" className="app-content">
        <div className="container">
          <h1>Binance landing</h1>
        </div>
      </main>
      <ScanFooter path="home" />
    </div>
  );
};

export default BinancePage;
