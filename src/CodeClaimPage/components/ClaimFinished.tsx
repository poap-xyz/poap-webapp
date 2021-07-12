import React, { useEffect, useState } from 'react';

/* Helpers */
import { getTokensFor, HashClaim, TokenInfo } from '../../api';
import { isValidEmail } from '../../lib/helpers';

/* Components */
import { LinkButton } from '../../components/LinkButton';
import ClaimFooterMessage from './ClaimFooterMessage';

/*
 * @dev: Component to show minted token
 * */
const ClaimFinished: React.FC<{ claim: HashClaim }> = ({ claim }) => {
  const claimedWithEmail = !!(claim && claim.claimed && claim.user_input && isValidEmail(claim.user_input));

  const [tokens, setTokens] = useState<TokenInfo[] | null>(null);

  useEffect(() => {
    getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appLink = claimedWithEmail ? `/scan/${claim.user_input}` : `/scan/${claim.beneficiary}`;
  const calcDaysAgo = (date: string) => {
    const today = new Date();
    const dateParameter = new Date(date);
    const isToday =
      dateParameter.getDate() === today.getDate() &&
      dateParameter.getMonth() === today.getMonth() &&
      dateParameter.getFullYear() === today.getFullYear();
    if (isToday) {
      return 0;
    } else {
      let daysAgo = Math.trunc((new Date().getTime() - new Date(claim.claimed_date).getTime()) / (24 * 60 * 60 * 1000));
      daysAgo = daysAgo === 0 ? 1 : daysAgo;
      return daysAgo;
    }
  };
  const daysAgo = calcDaysAgo(claim.claimed_date);
  const claimedDate = new Date(claim.claimed_date);
  const day = parseInt(claimedDate.toLocaleDateString('en-US', { day: 'numeric' }));
  const claimedDateString =
    claimedDate.toLocaleDateString('en-US', { month: 'long' }) +
    ` ${day}${
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th'
    }, ` +
    claimedDate.toLocaleDateString('en-US', { year: 'numeric' });

  const getEvents = async () => {
    try {
      const tokens = await getTokensFor(claim.beneficiary);
      setTokens(tokens);
    } catch (e) {
      console.log(e);
    }
  };

  const tokensMessage = () => {
    if (tokens) {
      if (tokens.length === 0) {
        return 'This is your first POAP';
      } else {
        return `After this minting, this collection has ${tokens.length + 1} POAP tokens`;
      }
    }
    return null;
  };

  const poapGalleryUrl = () => {
    return `https://poap.gallery/event/${claim.event_id}`;
  };

  return (
    <div className={'claim-info'} data-aos="fade-up" data-aos-delay="300">
      <div className={'info-title'}>
        Congratulations! <br />
        {claim.event.name} POAP was added to your collection <br />
      </div>
      <div className={'text-info'}>
        {daysAgo >= 0 ? (
          <span>
            This POAP was minted{' '}
            {daysAgo === 0
              ? 'today'
              : daysAgo === 1
              ? `1 day ago on ${claimedDateString}`
              : `${daysAgo} days ago on ${claimedDateString}`}
          </span>
        ) : null}
        <br />
        {tokensMessage()}
        <br />
        Keep growing your POAP collection!
        <br />
        See who else got it at <a href={poapGalleryUrl()}>POAP Gallery</a>
      </div>
      <LinkButton text={'Browse collection'} link={appLink} extraClass={'link-btn'} />
      <ClaimFooterMessage />
    </div>
  );
};

export default ClaimFinished;
