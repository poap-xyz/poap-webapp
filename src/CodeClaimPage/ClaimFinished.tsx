import React from 'react';

/* Helpers */
import { HashClaim } from '../api';
import { isValidEmail } from '../lib/helpers';

/* Components */
import { LinkButton } from '../components/LinkButton';
import ClaimFooterMessage from './ClaimFooterMessage';

/*
 * @dev: Component to show minted token
 * */
const ClaimFinished: React.FC<{ claim: HashClaim }> = ({ claim }) => {
  const claimedWithEmail = !!(claim && claim.claimed && claim.user_input && isValidEmail(claim.user_input));

  const appLink = claimedWithEmail ? `/scan/${claim.user_input}` : `/scan/${claim.beneficiary}`;

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>
        Congratulations! <br />
        {claim.event.name} badge is now in your wallet
      </div>
      <div className={'text-info'}>Keep growing your POAP collection!</div>
      <LinkButton text={'Check my badges'} link={appLink} extraClass={'link-btn'} />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimFinished;
