import React from 'react';
import FooterShadow from '../images/footer-shadow.svg';
import FooterShadowDesktop from '../images/footer-shadow-desktop.svg';
import PoapBadge from '../images/POAP.svg';
import Twitter from '../images/logo-twitter.svg';
import Telegram from '../images/logo-telegram.svg';
import Github from '../images/logo-git.svg';
// import BuiltOnEth from '../images/built-on-eth.png';

type ClaimFooterProps = {
  path: string;
};

export const ClaimFooter: React.FC = () => (
  <footer role="contentinfo" className="footer-events white-background">
    <div className="image-footer">
      <img src={FooterShadow} className="mobile" alt="" />
      <img src={FooterShadowDesktop} className="desktop" alt="" />
    </div>
    <div className="footer-content">
      <div className="container">
        <a href={'https://www.poap.xyz'} target={'_blank'}>
          <img src={PoapBadge} alt="" className="decoration" />
        </a>
        <div className={'social-icons'}>
          <a href={'https://twitter.com/poapxyz/'} target={'_blank'}>
            <img src={Twitter} alt="Twitter" />
          </a>
          <a href={'https://t.me/poapxyz'} target={'_blank'}>
            <img src={Telegram} alt="Telegram" />
          </a>
          <a href={'https://github.com/poapxyz/poap'} target={'_blank'}>
            <img src={Github} alt="Github" />
          </a>
        </div>
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
      </div>
    </div>
  </footer>
);
