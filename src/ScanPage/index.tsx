import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RouteComponentProps, Route } from 'react-router';
import { ChooseAddressPage } from './ChooseAddressPage';
import { AddressTokensPage } from './AddressTokensPage';
import { TokenDetailPage } from './TokenDetailPage';

import FooterShadow from '../images/footer-shadow.svg';
import FooterShadowDesktop from '../images/footer-shadow-desktop.svg';
import FooterPattern from '../images/footer-pattern.svg';
import PoapLogo from '../images/POAP.svg';
import BuiltOnEth from '../images/built-on-eth.png';
import { useBodyClassName } from '../react-helpers';
import { ROUTES } from '../lib/constants';

type ScanFooterProps = {
  path: string;
};

export const ScanPage: React.FC<RouteComponentProps> = ({ match, history, location }) => {
  const showBadges = useCallback(
    (addressOrENS: string, address: string) => {
      return history.push(`${match.path}scan/${addressOrENS}`, { address });
    },
    [history, match],
  );
  useBodyClassName('poap-app');

  const resolvePathname = (): string => {
    const { pathname } = history.location;
    if (pathname.includes('/claim')) return 'claim';
    if (pathname.includes('/token')) return 'token';
    return 'home';
  };

  return (
    <div className="landing">
      <ScanHeader sectionName="Scan" />
      <Route exact path={ROUTES.home} render={() => <ChooseAddressPage onAccountDetails={showBadges} />} />
      <Route exact path={ROUTES.scanHome} render={() => <ChooseAddressPage onAccountDetails={showBadges} />} />
      <Route path={ROUTES.scan} component={AddressTokensPage} />
      <Route path={ROUTES.token} component={TokenDetailPage} />
      <ScanFooter path={resolvePathname()} />
    </div>
  );
};

type ScanHeaderProps = {
  sectionName: string;
};

export const ScanHeader: React.FC<ScanHeaderProps> = ({ sectionName }) => (
  <header id="site-header" role="banner">
    <div className="container">
      <div className="col-xs-6 col-sm-6 col-md-6">
        <Link to="/" className="logo">
          <img src={PoapLogo} alt="POAP" />
        </Link>
      </div>
      <div className="col-xs-6 col-sm-6 col-md-6">
        <p className="page-title">{sectionName}</p>
      </div>
    </div>
  </header>
);

export const ScanFooter: React.FC<ScanFooterProps> = ({ path }) => (
  <footer
    role="contentinfo"
    className={`footer-events 
    ${path === 'home' ? 'normal-background' : ''} 
    ${path === 'token' ? 'secondary-background' : ''}`}
  >
    <div className="image-footer">
      <img src={FooterShadow} className="mobile" alt="" />
      <img src={FooterShadowDesktop} className="desktop" alt="" />
    </div>
    <div className="footer-content">
      <div className="container">
        <img src={FooterPattern} alt="" className="decoration big-picture" />
        <p className="made-by">
          Made with{' '}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g data-name="Layer 2">
              <g data-name="heart">
                <rect width="24" height="24" />
                <path d="M12 21a1 1 0 0 1-.71-.29l-7.77-7.78a5.26 5.26 0 0 1 0-7.4 5.24 5.24 0 0 1 7.4 0L12 6.61l1.08-1.08a5.24 5.24 0 0 1 7.4 0 5.26 5.26 0 0 1 0 7.4l-7.77 7.78A1 1 0 0 1 12 21z" />
              </g>
            </g>
          </svg>
          by
          <a
            target="_blank"
            href="https://xivis.com"
            rel="noopener noreferrer"
            className="made-by-link highlight-effect"
          >
            Xivis
          </a>
        </p>
        <div className="eth-branding">
          <img src={BuiltOnEth} alt="Built on Ethereum" />
        </div>
      </div>
    </div>
  </footer>
);
