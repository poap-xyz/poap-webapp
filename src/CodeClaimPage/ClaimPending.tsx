import React, { useEffect } from 'react';

/* Helpers */
import { HashClaim } from '../api';
import { blockscoutLinks } from '../lib/constants';

/* Components */

import { LinkButton } from '../components/LinkButton';
/* Assets */
import Spinner from '../images/etherscan-spinner.svg';
import ClaimFooterMessage from './ClaimFooterMessage';

/*
 * @dev: Component to show user that transactions is being mined
 * */
const ClaimPending: React.FC<{ claim: HashClaim; checkClaim: (hash: string) => void }> = ({ claim, checkClaim }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      checkClaim(claim.qr_hash);
    }, 1000);
    return () => clearInterval(interval);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>The POAP token is on its way to your wallet</div>
      <div className={'info-tx info-pending'}>
        <img src={Spinner} alt={'Mining'} />
        Pending
      </div>
      <div className={'text-info'}>Please wait a few seconds, or follow the transaction on the block explorer</div>
      <LinkButton
        text={'View Transaction'}
        link={blockscoutLinks.tx(claim.tx_hash)}
        extraClass={'link-btn'}
        target={'_blank'}
      />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimPending;
