import React from 'react';

/* Helpers */
import { HashClaim } from 'api';

/* Components */
import ClaimFooterMessage from './ClaimFooterMessage';

const ClaimBlocked: React.FC<{ claim: HashClaim }> = ({ claim }) => {
  return (
    <div
      className={'container claim-info claim-delegated'}
      data-aos={'fade-up'}
      data-aos-delay="300"
    >
      <form className={'claim-form'}>
        <input type={'text'} disabled={true} value={claim.beneficiary} />
        <div className={'web3-browser'}>
          This POAP is reserved and will son be sent. <a href={'mailto:hello@poap.xyz'}>Need help?</a>
        </div>
      </form>
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimBlocked;
