import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { ROUTES } from './lib/constants';
import { AuthProvider, AuthService } from './auth';
import { Callback } from './auth/Callback';
import { BackOffice } from './backoffice/Main';
import { CodeClaimPage } from './CodeClaimPage';
import { ScanPage } from './ScanPage';
import { AdminLoginPage } from './AdminLoginPage';
import { RedeemPage } from './RedeemPage';
import CheckoutPage from './CheckoutPage';

type AppProps = { auth: AuthService };

const App: React.FC<AppProps> = ({ auth }) => (
  <AuthProvider value={auth}>
    <Router>
      <Switch>
        {/* Render redirects */}
        <Redirect from={ROUTES.renderToken} to={ROUTES.token} />
        
        {/* Backoffice */}
        <Route exact path={ROUTES.callback} component={Callback} />
        <Route exact path={ROUTES.adminLogin.path} component={AdminLoginPage} />
        <Route path={ROUTES.admin} component={BackOffice} />

        {/* dApp / claims */}
        <Route path={ROUTES.codeClaimWeb3PageHash} component={CodeClaimPage} />
        <Route path={ROUTES.codeClaimPageHash} component={CodeClaimPage} />
        <Route path={ROUTES.codeClaimPage} component={CodeClaimPage} />
        <Route path={ROUTES.redeem} component={RedeemPage} />

        {/* Checkout */}
        <Route path={ROUTES.checkouts.main} component={CheckoutPage} />

        {/* Home */}
        <Route path={ROUTES.home} component={ScanPage} />
      </Switch>
    </Router>
  </AuthProvider>
);

export default App;
