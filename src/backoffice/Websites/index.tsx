import React from 'react';
import { Route, Switch } from 'react-router-dom';

/* Constants */
import { ROUTES } from '../../lib/constants';

/* Checkout Components */
import WebsiteList from './WebsitesList';
import WebsiteForm from './WebsiteForm';

export const Websites = () => (
  <Switch>
    <Route exact path={ROUTES.websites.newForm.path} component={WebsiteForm} />
    <Route exact path={ROUTES.websites.editForm.path} component={WebsiteForm} />
    <Route exact path={ROUTES.websites.admin.path} component={WebsiteList} />
  </Switch>
);
