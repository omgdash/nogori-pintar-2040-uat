import React from 'react';
import nogoriPintarLogo from '../assets/logo-nogori-pintar.png';

interface OfficialNogoriPintarLogoProps {
  className?: string;
  alt?: string;
}

export const OfficialNogoriPintarLogo: React.FC<OfficialNogoriPintarLogoProps> = ({
  className = '',
  alt = 'Logo Rasmi Nogori Pintar 2040'
}) => {
  return (
    <img
      src={nogoriPintarLogo}
      alt={alt}
      className={`object-contain select-none max-h-full ${className}`}
      draggable={false}
      loading="eager"
      decoding="async"
    />
  );
};

export default OfficialNogoriPintarLogo;
