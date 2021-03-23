import React, { FC, CSSProperties } from 'react';
/*
 * @dev: Common message for footer on QR claim system
 * */

type Props = {
  linkStyle?: CSSProperties;
};

const ClaimFooterMessage: FC<Props> = ({ linkStyle }) => (
  <div className={'claim-footer'}>
    <div className={'title'}>Your community can use POAP 🎖 too:</div>
    <div className={'subtitle'}>
      Fill out{' '}
      <a style={linkStyle} href={'https://www.poap.xyz/form'} target={'blank'}>
        this form
      </a>{' '}
      📋 to learn how.
    </div>
  </div>
);

export default ClaimFooterMessage;
