import React, { FC } from 'react';

/* Lib */
import { useImageSrc } from 'lib/hooks/useImageSrc';

/* Types */
import { Template, TemplatePageFormValues, HashClaim } from 'api';

/* Assets */
import PoapBadge from 'images/POAP.svg';
import Twitter from 'images/logo-twitter.svg';
import Telegram from 'images/logo-telegram.svg';
import Github from 'images/logo-git.svg';

type Props = {
  template?: TemplatePageFormValues | Template;
  claim?: HashClaim;
};

export const TemplateClaimFooter: FC<Props> = ({ template, claim }) => {
  const templateFooterIconRaw = claim?.event_template?.footer_icon ?? template?.footer_icon;
  const templateFooterColor = claim?.event_template?.footer_color ?? template?.footer_color;

  const templateFooterIcon = useImageSrc(templateFooterIconRaw);

  return (
    <div
      className="template-claim-footer"
      style={{ backgroundColor: templateFooterColor || 'purple' }}
    >
      <div className="footer-icon-container ">
        {templateFooterIcon && (
          <img className="footer-icon" alt="Brand logo" src={templateFooterIcon} />
        )}
      </div>
      <div>
        <div className="footer-content">
          <div className="container">
            <a href={'https://www.poap.xyz'} target={'_blank'} rel="noopener noreferrer">
              <img src={PoapBadge} alt="" className="decoration" />
            </a>
            <div className={'social-icons'}>
              <a href={'https://twitter.com/poapxyz/'} target={'_blank'} rel="noopener noreferrer">
                <img src={Twitter} alt="Twitter" />
              </a>
              <a href={'https://t.me/poapxyz'} target={'_blank'} rel="noopener noreferrer">
                <img src={Telegram} alt="Telegram" />
              </a>
              <a
                href={'https://github.com/poapxyz/poap'}
                target={'_blank'}
                rel="noopener noreferrer"
              >
                <img src={Github} alt="Github" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
