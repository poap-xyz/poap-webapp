import React from 'react';
import FooterShadow from '../images/footer-shadow.svg';
import FooterShadowDesktop from '../images/footer-shadow-desktop.svg';
import PoapBadge from '../images/POAP.svg';
import Twitter from '../images/logo-twitter.svg';
import Telegram from '../images/logo-telegram.svg';
import Github from '../images/logo-git.svg';

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
      </div>
    </div>
  </footer>
);
