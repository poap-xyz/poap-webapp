import React from 'react';
import { Route, Switch } from 'react-router-dom';

/* Constants */
import { ROUTES } from '../../lib/constants';

/* Checkout Components */
import DeliveriesList from './DeliveriesList';
// import CheckoutForm from '../Checkouts/CheckoutForm';

export const Deliveries = () => (
  <Switch>
    {/*<Route exact path={ROUTES.checkouts.newForm.path} component={CheckoutForm} />*/}
    {/*<Route exact path={ROUTES.checkouts.editForm.path} component={CheckoutForm} />*/}
    <Route exact path={ROUTES.deliveries.admin.path} component={DeliveriesList} />
  </Switch>
);
