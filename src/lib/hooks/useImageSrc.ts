import { useState, useEffect } from 'react';

// lib
import { getBase64 } from '../helpers';

export const useImageSrc = (image: Blob | string | undefined): string | undefined => {
  // react hooks
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  // effect
  useEffect(() => {
    if (image) {
      if (typeof image === 'object') getBase64(image, setImageUrl);
      if (typeof image === 'string') setImageUrl(image);
    }
  }, [image]);

  return imageUrl;
};
