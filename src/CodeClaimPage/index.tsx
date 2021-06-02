import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';

/* Helpers */
import { HashClaim, getClaimHash, getTokensFor } from '../api';
import { isValidEmail } from '../lib/helpers';

/* Components*/
import ClaimForm from './components/ClaimForm';
import QRHashForm from './components/QRHashForm';
import ClaimHeader from './components/ClaimHeader';
import ClaimLoading from './components/ClaimLoading';
import ClaimPending from './components/ClaimPending';
import ClaimFinished from './components/ClaimFinished';
import { TemplateClaimLoading } from './templateClaim/TemplateClaimLoading';
import { ClaimFooter } from 'components/ClaimFooter';

/* Constants */
import { TX_STATUS } from '../lib/constants';

/* Assets */
import EmptyBadge from '../images/empty-badge.svg';
import { TemplateClaimFooter } from './templateClaim/TemplateClaimFooter';
import { TemplateClaimHeader } from './templateClaim/TemplateClaimHeader';

export const CodeClaimPage: React.FC<RouteComponentProps<{ hash: string }>> = ({ match }) => {
  const [claim, setClaim] = useState<null | HashClaim>(null);
  const [claimError, setClaimError] = useState<boolean>(false);
  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [beneficiaryHasToken, setBeneficiaryHasToken] = useState<boolean>(false);

  let { hash } = match.params;
  let title = 'POAP Claim';
  let image = EmptyBadge;

  useEffect(() => {
    if (hash) fetchClaim(hash);
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */
  useEffect(() => {
    if (claim && !isVerified) {
      checkUserTokens();
    }
  }, [claim]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const fetchClaim = async (hash: string): Promise<null | HashClaim> => {
    setIsClaimLoading(true);
    try {
      const _claim = await getClaimHash(hash.toLowerCase());
      setClaim(_claim);
      setClaimError(false);
      setIsClaimLoading(false);
      return _claim;
    } catch (e) {
      setClaimError(true);
      setIsClaimLoading(false);
    }
    return null;
  };

  const checkUserTokens = () => {
    console.log('check user tokens');
    if (!claim) return;

    let { user_input, beneficiary } = claim;

    let userToValidate: string | null = beneficiary;
    if (!userToValidate) {
      if (user_input && isValidEmail(user_input)) {
        userToValidate = user_input;
      }
    }

    if (!userToValidate) {
      setIsVerified(true);
      return;
    }

    getTokensFor(userToValidate)
      .then((tokens) => {
        const hasToken = tokens.filter((token) => token.event.id === claim.event_id).length > 0;
        if (hasToken) {
          setBeneficiaryHasToken(true);
        }
      })
      .finally(() => {
        setIsVerified(true);
      });
  };

  const continueClaim = (claim: HashClaim) => {
    setIsVerified(false);
    setClaim(claim);
  };

  /* Render component */
  const claimedWithEmail = !!(claim && claim.claimed && claim.user_input && isValidEmail(claim.user_input));
  let body = <QRHashForm loading={isClaimLoading} checkClaim={fetchClaim} error={claimError} qrHash={hash || ''} />;

  if (claim && claim.event.image_url) {
    image = claim.event.image_url;
  }

  if (claim && isVerified) {
    body = <ClaimForm claim={claim} onSubmit={continueClaim} />;

    title = claim.event.name;
    if (claim.claimed) {
      // POAP minting
      body = <ClaimPending claim={claim} checkClaim={fetchClaim} />;

      if ((claim.tx_status && claim.tx_status === TX_STATUS.passed) || beneficiaryHasToken || claimedWithEmail) {
        body = <ClaimFinished claim={claim} />;
      }
    }
  }

  if (claim && !claimError && !isVerified) {
    body = <ClaimLoading />;
  }

  return (
    <>
      {hash && !claim && !claimError ? (
        <TemplateClaimLoading />
      ) : (
        <div className={'code-claim-page claim'}>
          {!claim?.event_template ? (
            <ClaimHeader
              title={title}
              image={image}
              claimed={!!(claim && claim.tx_status === TX_STATUS.passed) || claimedWithEmail}
            />
          ) : (
            <TemplateClaimHeader
              title={title}
              image={image}
              claimed={!!(claim && claim.tx_status === TX_STATUS.passed) || claimedWithEmail}
              claim={claim}
            />
          )}

          <div className={`claim-body ${claim?.event_template ? 'template' : ''}`}>{body}</div>
          {!claim?.event_template ? <ClaimFooter /> : <TemplateClaimFooter claim={claim} />}
        </div>
      )}
    </>
  );
};
