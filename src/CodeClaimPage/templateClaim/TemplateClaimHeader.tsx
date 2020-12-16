import React, { FC } from 'react';

// assets
import Star from 'images/white-star.svg';
import HeaderShadow from 'images/header-shadow-desktop-white.svg';

// lib
import { COLORS, STYLES } from 'lib/constants';
import { HashClaim } from 'api';

// types
import { TemplatePageFormValues, Template } from 'api';
import { useImageSrc } from 'lib/hooks/useImageSrc';

type Props = {
  title: string;
  image: string;
  claimed: boolean;
  claim?: HashClaim;
  template?: TemplatePageFormValues | Template;
};

export const TemplateClaimHeader: FC<Props> = ({ claim, title, image, claimed, template }) => {
  const headerColor = claim?.event_template?.header_color ?? template?.header_color;
  const headerLinkColor = claim?.event_template?.header_link_color ?? template?.header_link_color;
  const headerLinkText = claim?.event_template?.header_link_text ?? template?.header_link_text;
  const headerLinkUrl = claim?.event_template?.header_link_url ?? template?.header_link_url;
  const mainColor = claim?.event_template?.main_color ?? template?.main_color;
  const titleImageRaw = claim?.event_template?.title_image ?? template?.title_image;
  const titleLink = claim?.event_template?.title_link ?? template?.title_link;
  const leftImageLink = claim?.event_template?.left_image_link ?? template?.left_image_link;
  const leftImageUrlRaw = claim?.event_template?.left_image_url ?? template?.left_image_url;
  const rightImageLink = claim?.event_template?.right_image_link ?? template?.right_image_link;
  const rightImageUrlRaw = claim?.event_template?.right_image_url ?? template?.right_image_url;

  const titleImage = useImageSrc(titleImageRaw);
  const rightImageUrl = useImageSrc(rightImageUrlRaw);
  const leftImageUrl = useImageSrc(leftImageUrlRaw);

  return (
    <>
      <div style={{ backgroundColor: headerColor }} className="template-claim-header">
        <div className="title-container">
          <a href={titleLink} rel="noopener noreferrer" target="_blank">
            <img alt="Brand title" src={titleImage} />
          </a>
        </div>
        <div className="header-link-container">
          <a
            style={{ color: headerLinkColor }}
            href={headerLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {headerLinkText}
          </a>
        </div>
      </div>
      <div className={'claim-header template'}>
        <div style={{ color: mainColor ?? COLORS.primaryColor }} className={'template-title'}>
          {title}
        </div>
        <div
          className={'logo-event'}
          style={{ boxShadow: mainColor ? STYLES.boxShadow(mainColor) : '' }}
        >
          <div className="image-wrapper">{image && <img src={image} alt="Event" />}</div>
          {claimed && (
            <div className={'claimed-badge'}>
              <img src={Star} alt={'Badge claimed'} />
            </div>
          )}
        </div>
        <div className={'wave-holder'}>
          <img src={HeaderShadow} alt={''} />
        </div>

        {leftImageUrl ? (
          leftImageLink ? (
            <a href={leftImageLink} rel="noopener noreferrer" target="_blank" className={'side-banner'}>
              <img alt="Brand publicity" src={leftImageUrl} className="left-image" />
            </a>
          ) : (
            <img alt="Brand publicity" src={leftImageUrl} className="left-image" />
          )
        ) : null}

        {rightImageUrl ? (
          rightImageLink ? (
            <a href={rightImageLink} rel="noopener noreferrer" target="_blank" className={'side-banner'}>
              <img alt="Brand publicity" src={rightImageUrl} className="right-image" />
            </a>
          ) : (
            <img alt="Brand publicity" src={rightImageUrl} className="right-image" />
          )
        ) : null}
      </div>
    </>
  );
};
