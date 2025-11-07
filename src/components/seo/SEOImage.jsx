import React from 'react';

/**
 * SEO-optimized image component with lazy loading, responsive srcset, and proper alt text
 */
export const SEOImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  loading = 'lazy',
  sizes = '100vw',
  priority = false 
}) => {
  // Generate srcset for responsive images if needed
  const srcset = src ? `${src} 1x` : undefined;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : loading}
      decoding="async"
      sizes={sizes}
      srcSet={srcset}
    />
  );
};