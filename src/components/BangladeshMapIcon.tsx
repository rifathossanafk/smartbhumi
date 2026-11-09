import React from 'react';

interface Props {
  className?: string;
  size?: number | string;
  withCircle?: boolean;
}

export const BangladeshMapIcon: React.FC<Props> = ({
  className = 'w-6 h-6',
  size,
}) => {
  return (
    <img
      src="/logo.png"
      alt="LandProof Bangladesh Logo"
      className={`${className} object-contain`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
};
