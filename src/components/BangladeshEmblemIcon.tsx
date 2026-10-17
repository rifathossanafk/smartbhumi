import React from 'react';

interface Props {
  className?: string;
  size?: number | string;
}

/**
 * Official National Emblem of Bangladesh (গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের জাতীয় প্রতীক)
 * Features:
 * - National flower Shapla (Water Lily) in the center floating on water
 * - Flanked on both sides by paddy / rice sheaves (ধানের শীষ)
 * - Three connected jute leaves at the crest (পাট পাতা)
 * - Four stars representing national principles (৪টি তারকা)
 */
export const BangladeshEmblemIcon: React.FC<Props> = ({
  className = 'w-6 h-6',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Government of Bangladesh Emblem"
    >
      {/* Outer circular gold/emerald accent ring */}
      <circle cx="50" cy="50" r="47" stroke="#fbbf24" strokeWidth="2.5" fill="none" opacity="0.85" />
      <circle cx="50" cy="50" r="44" fill="#006a4e" />

      {/* Central National Flag Crimson Sun */}
      <circle cx="50" cy="52" r="23" fill="#f42a41" />

      {/* Water Ripples below the Shapla */}
      <path
        d="M34 68 Q50 72 66 68"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M37 72 Q50 76 63 72"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shapla (Water Lily) Flower */}
      {/* Center petal */}
      <path
        d="M50 36 C48 42 46 48 47 58 C48 61 52 61 53 58 C54 48 52 42 50 36 Z"
        fill="#ffffff"
      />
      {/* Left inner petal */}
      <path
        d="M50 42 C44 46 39 52 41 60 C43 61 46 61 48 57 C48 51 49 46 50 42 Z"
        fill="#ffffff"
      />
      {/* Right inner petal */}
      <path
        d="M50 42 C56 46 61 52 59 60 C57 61 54 61 52 57 C52 51 51 46 50 42 Z"
        fill="#ffffff"
      />
      {/* Left outer petal */}
      <path
        d="M48 48 C38 52 32 58 35 64 C38 65 42 63 45 59 C46 55 47 51 48 48 Z"
        fill="#ffffff"
      />
      {/* Right outer petal */}
      <path
        d="M52 48 C62 52 68 58 65 64 C62 65 58 63 55 59 C54 55 53 51 52 48 Z"
        fill="#ffffff"
      />

      {/* Paddy / Rice Sheaves on Left (ধানের শীষ) */}
      <path
        d="M32 75 C24 66 21 52 23 38 C24 35 25 32 27 30"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left grains */}
      <ellipse cx="23" cy="58" rx="3" ry="1.5" transform="rotate(-30 23 58)" fill="#fbbf24" />
      <ellipse cx="21" cy="50" rx="3" ry="1.5" transform="rotate(-20 21 50)" fill="#fbbf24" />
      <ellipse cx="22" cy="42" rx="3" ry="1.5" transform="rotate(-10 22 42)" fill="#fbbf24" />
      <ellipse cx="25" cy="34" rx="3" ry="1.5" transform="rotate(10 25 34)" fill="#fbbf24" />
      <ellipse cx="28" cy="27" rx="3" ry="1.5" transform="rotate(30 28 27)" fill="#fbbf24" />

      {/* Paddy / Rice Sheaves on Right (ধানের শীষ) */}
      <path
        d="M68 75 C76 66 79 52 77 38 C76 35 75 32 73 30"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right grains */}
      <ellipse cx="77" cy="58" rx="3" ry="1.5" transform="rotate(30 77 58)" fill="#fbbf24" />
      <ellipse cx="79" cy="50" rx="3" ry="1.5" transform="rotate(20 79 50)" fill="#fbbf24" />
      <ellipse cx="78" cy="42" rx="3" ry="1.5" transform="rotate(10 78 42)" fill="#fbbf24" />
      <ellipse cx="75" cy="34" rx="3" ry="1.5" transform="rotate(-10 75 34)" fill="#fbbf24" />
      <ellipse cx="72" cy="27" rx="3" ry="1.5" transform="rotate(-30 72 27)" fill="#fbbf24" />

      {/* Crest: Three connected Jute Leaves (পাট পাতা) */}
      {/* Center leaf */}
      <path
        d="M50 14 C48 18 48 23 50 27 C52 23 52 18 50 14 Z"
        fill="#fbbf24"
      />
      {/* Left leaf */}
      <path
        d="M50 25 C45 23 41 20 42 16 C45 17 48 21 50 25 Z"
        fill="#fbbf24"
      />
      {/* Right leaf */}
      <path
        d="M50 25 C55 23 59 20 58 16 C55 17 52 21 50 25 Z"
        fill="#fbbf24"
      />

      {/* Four National Stars (৪টি তারকা) */}
      {/* Left 2 stars */}
      <g fill="#fbbf24">
        <polygon points="35,16 36.2,19.5 39.8,19.5 36.9,21.7 38,25 35,23 32,25 33.1,21.7 30.2,19.5 33.8,19.5" transform="scale(0.55) translate(28, 6)" />
        <polygon points="35,16 36.2,19.5 39.8,19.5 36.9,21.7 38,25 35,23 32,25 33.1,21.7 30.2,19.5 33.8,19.5" transform="scale(0.55) translate(42, 10)" />
      </g>
      {/* Right 2 stars */}
      <g fill="#fbbf24">
        <polygon points="35,16 36.2,19.5 39.8,19.5 36.9,21.7 38,25 35,23 32,25 33.1,21.7 30.2,19.5 33.8,19.5" transform="scale(0.55) translate(72, 10)" />
        <polygon points="35,16 36.2,19.5 39.8,19.5 36.9,21.7 38,25 35,23 32,25 33.1,21.7 30.2,19.5 33.8,19.5" transform="scale(0.55) translate(86, 6)" />
      </g>
    </svg>
  );
};
