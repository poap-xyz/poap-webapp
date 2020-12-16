/* eslint jsx-a11y/anchor-is-valid: 0 */
import React, { useContext, useState } from 'react';
import { Link, Redirect, Route, withRouter, Switch } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';

// lib
import { AuthContext, authClient } from 'auth';

/* Assets */
import PoapLogo from 'images/POAP.svg';
import Calendar from 'images/calendar.svg';
import Qr from 'images/qr-code.svg';

/* Constants */
import { ROUTES, LABELS } from '../lib/constants';

/* Components */
import { BurnPage } from './BurnPage';
import { IssueForEventPage, IssueForUserPage } from './IssuePage';
import { AddressManagementPage } from './AddressManagementPage';
import { TransactionsPage } from './TransactionsPage';
import { InboxPage } from './InboxPage';
import { InboxListPage } from './InboxListPage';
import { QrPage } from './QrPage';
import { EventsPage } from './EventsPage';
import { TemplatePage } from './templates/TemplatePage';
import { TemplateFormPage } from './templates/TemplateFormPage';

export const MintersPage = () => <div> This is a MintersPage </div>;

type RouteProps = {
  path: string;
  roles?: string[];
  title?: string;
};

type LabelProps = {
  roles: string[];
  title: string;
};

const Label: React.FC<{ label: LabelProps }> = ({ label }) => {
  const { title } = label;
  return <h2>{title}</h2>;
};

const SidebarLink: React.FC<{ route: RouteProps; handleClick: () => void }> = ({
  route,
  handleClick,
}) => {
  const { path, title } = route;
  if (typeof route === 'object' && title) {
    return (
      <Link className={'bm-item'} to={path} onClick={handleClick}>
        {title}
      </Link>
    );
  }

  return null;
};

export const withAuthentication = <T extends Object>(
  WrappedComponent: React.ComponentType<T>
): React.FC<T> => {
  return (props: T) => {
    const isAuthenticated = authClient.isAuthenticated();

    if (!isAuthenticated) return <Redirect to="/admin" />;

    return <WrappedComponent {...props} />;
  };
};

export const NavigationMenu = withRouter(({ history }) => {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useContext(AuthContext);

  const closeMenu = () => setIsOpen(false);

  const isAdmin = authClient.isAuthenticated();
  return (
    <Menu isOpen={isOpen} onStateChange={state => setIsOpen(state.isOpen)} right disableAutoFocus>
      {isAdmin && (
        <>
          <Label label={LABELS.issueBadges} />
          <SidebarLink route={ROUTES.issueForEvent} handleClick={closeMenu} />

          <SidebarLink route={ROUTES.issueForUser} handleClick={closeMenu} />
          <Label label={LABELS.inbox} />

          <SidebarLink route={ROUTES.inbox} handleClick={closeMenu} />

          <SidebarLink route={ROUTES.inboxList} handleClick={closeMenu} />

          <Label label={LABELS.otherTasks} />

          <SidebarLink route={ROUTES.addressManagement} handleClick={closeMenu} />

          <SidebarLink route={ROUTES.burn} handleClick={closeMenu} />

          <SidebarLink route={ROUTES.transactions} handleClick={closeMenu} />
        </>
      )}

      {!isAdmin && <Label label={LABELS.menu} />}

      <SidebarLink route={ROUTES.events} handleClick={closeMenu} />

      <SidebarLink route={ROUTES.qr} handleClick={closeMenu} />

      <SidebarLink route={ROUTES.template} handleClick={closeMenu} />

      {!isAdmin && <SidebarLink route={ROUTES.adminLogin} handleClick={closeMenu} />}

      {isAdmin && (
        <a
          className="bm-item"
          href=""
          onClick={() => {
            auth.logout();
          }}
        >
          Logout
        </a>
      )}
    </Menu>
  );
});

const Landing = () => {
  const isAdmin = authClient.isAuthenticated();
  return (
    <div className={'cards-container'}>
      <Link to={ROUTES.events.path} className={'card card-link'}>
        <h3>Manage Events</h3>
        <img className={'icon'} src={Calendar} alt={'Manage Events'} />
      </Link>
      {isAdmin && (
        <Link to={ROUTES.qr.path} className={'card card-link'}>
          <h3>Manage QR Codes</h3>
          <img className={'icon'} src={Qr} alt={'Manage QR Codes'} />
        </Link>
      )}
    </div>
  );
}

const IssueForEventPageWithAuthentication = withAuthentication(IssueForEventPage);
const IssueForUserPageWithAuthentication = withAuthentication(IssueForUserPage);
const InboxListPageWithAuthentication = withAuthentication(InboxListPage);
const TransactionsPageWithAuthentication = withAuthentication(TransactionsPage);
const MintersPageWithAuthentication = withAuthentication(MintersPage);
const BurnPageWithAuthentication = withAuthentication(BurnPage);
const InboxPageWithAuthentication = withAuthentication(InboxPage);
const AddressManagementPageWithAuthentication = withAuthentication(AddressManagementPage);

export const BackOffice: React.FC = () => (
  <>
    <header id="site-header" role="banner">
      <div className="container">
        <div className="col-xs-6 col-sm-6 col-md-6">
          <Link to="/admin" className="logo">
            <img src={PoapLogo} alt="POAP" />
          </Link>
        </div>
        <div className="col-xs-6 col-sm-6 col-md-6">
          <p className="page-title">BackOffice</p>
        </div>
      </div>
    </header>
    <main className="app-content backoffice">
      <div className="container">
        <Switch>
          <Route exact path={ROUTES.qr.path} render={() => <QrPage />} />

          <Route path={ROUTES.events.path} render={() => <EventsPage />} />

          <Route exact path={ROUTES.admin} render={() => <Landing />} />

          <Route exact path={ROUTES.template.path} component={TemplatePage} />

          <Route path={ROUTES.templateForm.path} component={TemplateFormPage} />

          <Route
            exact
            path={ROUTES.issueForEvent.path}
            render={() => <IssueForEventPageWithAuthentication />}
          />

          <Route
            exact
            path={ROUTES.issueForUser.path}
            render={() => <IssueForUserPageWithAuthentication />}
          />

          <Route
            exact
            path={ROUTES.minters.path}
            render={() => <MintersPageWithAuthentication />}
          />

          <Route exact path={ROUTES.burn.path} render={() => <BurnPageWithAuthentication />} />

          <Route exact path={ROUTES.burnToken.path} render={() => <BurnPageWithAuthentication />} />

          <Route
            exact
            path={ROUTES.addressManagement.path}
            render={() => <AddressManagementPageWithAuthentication />}
          />

          <Route
            exact
            path={ROUTES.transactions.path}
            render={() => <TransactionsPageWithAuthentication />}
          />

          <Route exact path={ROUTES.inbox.path} render={() => <InboxPageWithAuthentication />} />

          <Route
            exact
            path={ROUTES.inboxList.path}
            render={() => <InboxListPageWithAuthentication />}
          />

          <Route path="*" render={() => <Redirect to="/admin" />} />
        </Switch>
      </div>
    </main>

    <NavigationMenu />
  </>
);
