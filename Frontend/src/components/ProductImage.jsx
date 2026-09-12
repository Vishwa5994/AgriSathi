import React, { useState } from 'react';
import { getImageUrl } from '../utils/formatCurrency';

const CROP_FALLBACKS = {
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80',
  paddy: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
  sugarcane: 'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&w=800&q=80',
  cotton: 'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&w=800&q=80',
  apple: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
  mango: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
  chilli: 'https://images.unsplash.com/photo-1588879460618-924a065a2542?auto=format&fit=crop&w=800&q=80',
  chili: 'https://images.unsplash.com/photo-1588879460618-924a065a2542?auto=format&fit=crop&w=800&q=80'
};

const getFallbackImage = (altText) => {
  const text = (altText || '').toLowerCase();
  for (const [key, url] of Object.entries(CROP_FALLBACKS)) {
    if (text.includes(key)) return url;
  }
  return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
};

export const ProductImage = ({
  src,
  alt = 'Product Image',
  className = '',
  iconClassName = 'w-6 h-6 text-slate-400'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rawSrc = typeof src === 'object' && src !== null ? (src.picture || src.image_url) : src;
  const resolvedUrl = getImageUrl(rawSrc);
  const fallbackUrl = getFallbackImage(alt || (typeof src === 'object' ? src?.product_name : ''));

  if (!resolvedUrl || imageError) {
    return (
      <img
        src={fallbackUrl}
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      onLoad={() => setImageLoaded(true)}
      style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
      className={className}
    />
  );
};
