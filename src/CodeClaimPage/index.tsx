import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';

/* Helpers */
import { HashClaim, getClaimHash, getTokensFor } from '../api';
import { isValidEmail } from '../lib/helpers';

/* Components*/
import ClaimHeader from './ClaimHeader';
import QRHashForm from './QRHashForm';
import ClaimLoading from './ClaimLoading';
import ClaimForm from './ClaimForm';
import ClaimBlocked from './ClaimBlocked';
import ClaimPending from './ClaimPending';
import ClaimFinished from './ClaimFinished';
import ClaimBumped from './ClaimBumped';
import { TemplateClaimLoading } from './templateClaim/TemplateClaimLoading';
import { ClaimFooter } from '../components/ClaimFooter';

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

  const fetchClaim = (hash: string) => {
    setIsClaimLoading(true);
    getClaimHash(hash.toLowerCase())
      .then((claim) => {
        setClaim(claim);
        setClaimError(false);
      })
      .catch((error) => {
        setClaimError(true);
      })
      .finally(() => setIsClaimLoading(false));
  };

  const checkUserTokens = () => {
    console.log('check user tokens')
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

  let body = <QRHashForm loading={isClaimLoading} checkClaim={fetchClaim} error={claimError} />;

  if (claim && claim.event.image_url) {
    image = claim.event.image_url;
  }

  if (claim && isVerified) {
    body = <ClaimForm claim={claim} onSubmit={continueClaim} />;

    title = claim.event.name;
    if (claim.claimed) {
      if (!claim.tx_status && !beneficiaryHasToken) {
        body = <ClaimBlocked claim={claim} />;
      }
      // POAP minting
      if (claim.tx_status && claim.tx_status === TX_STATUS.pending) {
        body = <ClaimPending claim={claim} checkClaim={fetchClaim} />;
      }
      if ((claim.tx_status && claim.tx_status === TX_STATUS.passed) || beneficiaryHasToken) {
        body = <ClaimFinished claim={claim} />;
      }
      if (claim.tx_status && claim.tx_status === TX_STATUS.bumped) {
        body = <ClaimBumped claim={claim} />;
      }
    }
  }

  if (claim && !claimError && !isVerified) {
    body = <ClaimLoading />;
  }

  const claimedWithEmail = !!(claim && claim.claimed && claim.user_input && isValidEmail(claim.user_input));

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
