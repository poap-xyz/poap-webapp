import React from 'react';

/* Helpers */
import { HashClaim } from '../api';

/* Components */
import { LinkButton } from '../components/LinkButton';

/* Assets */
import ClaimFooterMessage from './ClaimFooterMessage';

/*
 * @dev: Component to show user that transactions is being mined
 * */
const ClaimBumped: React.FC<{ claim: HashClaim }> = ({ claim }) => {
  const etherscanLink = `https://etherscan.io/tx/${claim.tx_hash}`;
  const appLink = `/scan/${claim.beneficiary}`;

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>The POAP token is on its way to your wallet</div>
      <div className={'text-info'}>
        Your transaction was replaced for a new one with more gas price so you can get your POAP faster. You can check
        the{' '}
        <a href={etherscanLink} target={'_blank'}>
          transaction on Etherscan
        </a>
      </div>
      <LinkButton text={'Check my badges'} link={appLink} extraClass={'link-btn'} target={''} />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimBumped;
