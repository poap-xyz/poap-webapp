import React from 'react';
import { Route, Switch } from 'react-router-dom';

/* Constants */
import { ROUTES } from '../../lib/constants';

/* Checkout Components */
import CheckoutList from './CheckoutList';

export const Checkouts = () => (
  <Switch>
    <Route exact path={ROUTES.checkouts.admin.path} component={CheckoutList} />
  </Switch>
);
