import React from 'react';
import { Route, Switch } from 'react-router-dom';

/* Constants */
import { ROUTES } from '../../lib/constants';

/* Checkout Components */
import DeliveriesList from './DeliveriesList';
import DeliveryForm from './DeliveryForm';

export const Deliveries = () => (
  <Switch>
    <Route exact path={ROUTES.deliveries.newForm.path} component={DeliveryForm} />
    <Route exact path={ROUTES.deliveries.editForm.path} component={DeliveryForm} />
    <Route exact path={ROUTES.deliveries.admin.path} component={DeliveriesList} />
  </Switch>
);
