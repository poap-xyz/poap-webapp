import React, { FC, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { parse, isAfter } from 'date-fns';
import { useHistory } from 'react-router-dom';

/* UI Components */
import { ScanFooter, ScanHeader } from '../ScanPage';
import TokenDisplay from './components/TokenDisplay';
import CheckoutMessage from './components/CheckoutMessage';
import CheckoutForm from './components/CheckoutForm';
import CheckoutSuccess from './components/CheckoutSuccess';
import { Loading } from '../components/Loading';

/* API & Types */
import { Checkout, getCheckout } from '../api';

type CheckoutPageProps = {
  fancyId: string;
};

const CHECKOUTS_KEY = 'checkouts';

const CheckoutPage: FC<RouteComponentProps<CheckoutPageProps>> = ({ location, match }) => {
  /* State */
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<boolean>(false);

  const history = useHistory();

  /* Effects */
  useEffect(() => {
    const fn = async () => {
      try {
        const data = await getCheckout(match.params.fancyId);
        setCheckout(data);
      } catch (e) {
        setFetchError(true);
      }
    };
    if (!checkout) {
      setIsFetching(true);
      fn();
      setIsFetching(false);
    }
  }, [checkout, match]);

  const getLocalStorage = () => {
    let checkoutsString = localStorage.getItem(CHECKOUTS_KEY);
    let checkouts: {[id: string]: string} = {};
    if (checkoutsString) {
      checkouts = JSON.parse(checkoutsString);
    }
    return checkouts;
  };

  const renderBody = () => {
    // Loading scenario
    if (isFetching) {
      return (
        <>
          <TokenDisplay image={null} title={''} />
          <Loading />
        </>
      );
    }

    // Error scenario
    if (fetchError) {
      const msg =
        'We encountered an error while fetching the event information. Are you sure the website URL is correct?';
      return (
        <>
          <TokenDisplay image={null} title={''} />
          <CheckoutMessage message={msg} />
        </>
      );
    }

    if (!checkout) return <div />;
    let checkouts = getLocalStorage();
    if (checkouts[match.params.fancyId]) {
      return (
        <>
          <TokenDisplay image={checkout.event.image_url} title={checkout.event.name} />
          <CheckoutSuccess qr={checkouts[match.params.fancyId]} />
        </>
      );
    }

    // Before scenario
    const startDate = parse(`${checkout.start_time} +00`, 'yyyy-MM-dd HH:mm:ss X', new Date());
    const isFuture = isAfter(startDate, new Date());
    if (isFuture) {
      const msg = 'This event has not started yet. Please come back later!';
      return (
        <>
          <TokenDisplay image={checkout.event.image_url} title={checkout.event.name} />
          <CheckoutMessage message={msg} />
        </>
      );
    }

    // Expired scenario
    const endDate = parse(`${checkout.end_time} +00`, 'yyyy-MM-dd HH:mm:ss X', new Date());
    const isPast = isAfter(new Date(), endDate);
    if (isPast) {
      const msg = 'Ups! This event has already finished!';
      return (
        <>
          <TokenDisplay image={checkout.event.image_url} title={checkout.event.name} />
          <CheckoutMessage message={msg} />
        </>
      );
    }

    // Everything OK - Form scenario
    return (
      <>
        <TokenDisplay image={checkout.event.image_url} title={checkout.event.name} />
        <CheckoutForm fancyId={match.params.fancyId} onSuccess={onSuccess} />
      </>
    );
  };
  const onSuccess = (qr: string) => {
    let checkouts = getLocalStorage();
    checkouts[match.params.fancyId] = qr;
    localStorage.setItem(CHECKOUTS_KEY, JSON.stringify(checkouts));

    history.push(`/claim/${qr}`);
  };

  return (
    <div className="checkout-page">
      <ScanHeader sectionName="" />
      <main id="site-main" role="main" className="app-content">
        <div className="container">{renderBody()}</div>
      </main>
      <ScanFooter path="home" />
    </div>
  );
};

export default CheckoutPage;
