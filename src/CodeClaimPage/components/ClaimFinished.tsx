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
  const claimedDate = new Date(claim.claimed_date);
  const day = parseInt(claimedDate.toLocaleDateString("en-US", { day: 'numeric' }))
  const claimedDateString = 
    claimedDate.toLocaleDateString("en-US", { month: 'long' }) +
    ` ${day}${day === 1 || day === 21 || day === 31 ? 'st' : (day === 2 || day === 22) ? 'nd' : (day === 3 || day === 23) ? 'rd' : 'th'}, ` +
    claimedDate.toLocaleDateString("en-US", { year: 'numeric' });

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>
        Congratulations! <br />
        {claim.event.name} badge was added to your collection <br />
      </div>
      <div className={'text-info'}>
        {
          daysAgo >= 0 ? 
          <span>This POAP was minted {daysAgo === 0 ? 'today' : daysAgo === 1 ? `1 day ago on ${claimedDateString}` : `${daysAgo} days ago on ${claimedDateString}`}</span> : null
        }
        <br />
        Keep growing your POAP collection!
      </div>
      <LinkButton text={'Browse collection'} link={appLink} extraClass={'link-btn'} />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimFinished;
