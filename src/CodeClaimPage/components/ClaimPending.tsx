import React, { useEffect } from 'react';

/* Helpers */
import { HashClaim } from '../../api';
import { blockscoutLinks, TX_STATUS } from '../../lib/constants';

/* Components */
import ClaimFooterMessage from './ClaimFooterMessage';
import { LinkButton } from 'components/LinkButton';

/* Assets */
import Spinner from 'images/etherscan-spinner.svg';

/*
 * @dev: Component to show user that transactions is being mined
 * */
const ClaimPending: React.FC<{ claim: HashClaim; checkClaim: (hash: string) => Promise<null | HashClaim> }> = ({
  claim,
  checkClaim,
}) => {
  const checkLoop = async () => {
    const result = await checkClaim(claim.qr_hash);
    if (!result || result.tx_status === '' || result.tx_status === TX_STATUS.pending) {
      setTimeout(checkLoop, 5000);
    }
  };
  useEffect(() => {
    checkLoop();
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>This POAP is being added to your collection</div>
      <div className={'info-tx info-pending'}>
        <img src={Spinner} alt={'Mining'} />
        Pending
      </div>
      {claim.tx_hash && (
        <>
          <div className={'text-info'}>Please wait a few seconds, or follow the transaction on the block explorer</div>
          <LinkButton
            text={'View Transaction'}
            link={blockscoutLinks.tx(claim.tx_hash)}
            extraClass={'link-btn'}
            target={'_blank'}
          />
        </>
      )}
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimPending;
