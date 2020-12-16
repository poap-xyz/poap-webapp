import React, { CSSProperties } from 'react';
import classNames from 'classnames';
export const SubmitButton: React.FC<{
  text: string;
  isSubmitting: boolean;
  canSubmit: boolean;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}> = ({ isSubmitting, canSubmit, text, style, className, onClick = () => null }) => (
  <button
    className={classNames('btn', isSubmitting && 'loading', className && `${className}`)}
    type="submit"
    style={style}
    disabled={isSubmitting || !canSubmit}
    onClick={onClick}
  >
    {isSubmitting ? '' : text}
  </button>
);
