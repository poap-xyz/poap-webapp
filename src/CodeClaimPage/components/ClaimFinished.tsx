import React from 'react';

/* Helpers */
import { HashClaim } from '../../api';
import { isValidEmail } from '../../lib/helpers';

/* Components */
import { LinkButton } from '../../components/LinkButton';
import ClaimFooterMessage from './ClaimFooterMessage';

/*
 * @dev: Component to show minted token
 * */
const ClaimFinished: React.FC<{ claim: HashClaim }> = ({ claim }) => {
  const claimedWithEmail = !!(claim && claim.claimed && claim.user_input && isValidEmail(claim.user_input));

  const appLink = claimedWithEmail ? `/scan/${claim.user_input}` : `/scan/${claim.beneficiary}`;
  const calcDaysAgo = (date: string) => {
    var today = new Date();
    const dateParameter = new Date(date)
    const isToday = dateParameter.getDate() === today.getDate() && dateParameter.getMonth() === today.getMonth() && dateParameter.getFullYear() === today.getFullYear();
    if (isToday) {
      return 0;
    } else {
      var daysAgo = Math.trunc((new Date().getTime() - new Date(claim.claimed_date).getTime()) / (24 * 60 * 60 * 1000))
      daysAgo = daysAgo===0 ? 1 : daysAgo;
      return daysAgo;
    }
  }
  const daysAgo = calcDaysAgo(claim.claimed_date);

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>
        Congratulations! <br />
        {claim.event.name} badge was added to your collection <br />
      </div>
      <div className={'text-info'}>
        {
          daysAgo >= 0 ? 
          <span>This POAP was minted {daysAgo === 0 ? 'today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}</span> : null
        }
        <br />
        Keep growing your POAP collection!
      </div>
      <LinkButton text={'Check my badges'} link={appLink} extraClass={'link-btn'} />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimFinished;
