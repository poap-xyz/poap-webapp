import React from 'react';
import { Route, Switch } from 'react-router-dom';

/* Constants */
import { ROUTES } from '../../lib/constants';

/* Checkout Components */
import CheckoutList from './CheckoutList';
import CheckoutForm from './CheckoutForm';

export const Checkouts = () => (
  <Switch>
    <Route exact path={ROUTES.checkouts.newForm.path} component={CheckoutForm} />
    <Route exact path={ROUTES.checkouts.admin.path} component={CheckoutList} />
  </Switch>
);
