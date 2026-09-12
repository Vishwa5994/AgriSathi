import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

export const ProductImage = ({
  src,
  alt = 'Product Image',
  className = '',
  iconClassName = 'w-6 h-6 text-slate-400'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!src || imageError) {
    // Branded placeholder: gradient background + icon + first letter of alt
    const initial = alt ? alt.charAt(0).toUpperCase() : '?';
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 gap-1 ${className}`}
      >
        <ImageOff className={iconClassName} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      onLoad={() => setImageLoaded(true)}
      style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
      className={className}
    />
  );
};
