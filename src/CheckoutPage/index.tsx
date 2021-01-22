import React, { FC, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';

/* UI Components */
import { ScanFooter, ScanHeader } from '../ScanPage';

/* Hooks */

/* Helpers */

/* Types */
import { Checkout, getCheckout, getEvent } from '../api';

type CheckoutPageProps = {
  fancyId: string;
};

const CheckoutPage: FC<RouteComponentProps<CheckoutPageProps>> = ({ location, match }) => {
  /* State */
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  /* Effects */
  useEffect(() => {
    const fn = async () => {
      const data = await getCheckout(match.params.fancyId);
      setCheckout(data);
    };
    if (!checkout) {
      setIsFetching(true);
      fn();
      setIsFetching(false);
    }
  }, [location, match]);

  /*
   Scenario 1 - Not found / inactive
   Scenario 2 - Expired
   Scenario 3 - Ok!
  */

  return (
    <div className="checkout-page">
      <ScanHeader sectionName="" />
      <main id="site-main" role="main" className="app-content">
        <div className="container">
          {isFetching && (
            <h1>Is fetching!</h1>
          )}

          {checkout && (
            <pre>
              {JSON.stringify(checkout, undefined, 4)}
            </pre>
          )}

        </div>
      </main>
      <ScanFooter path="home" />
    </div>
  );
};

export default CheckoutPage;
