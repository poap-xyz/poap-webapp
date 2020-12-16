import React from 'react';

export const LinkButton: React.FC<{
  text: string;
  link: string;
  extraClass: string;
  target?: string;
}> = ({ text, link, extraClass, target='' }) => (
  <a className={`btn ${extraClass}`} href={link} target={target}>
    {text}
  </a>
);
