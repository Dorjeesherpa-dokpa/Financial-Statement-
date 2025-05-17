
import React from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 90L50 10L90 90H10Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M30 70L50 30L70 70H30Z"
        fill="white"
        fillOpacity="0.6"
      />
    </svg>
    <span className="font-bold text-lg md:text-xl">Zeta Energy</span>
  </div>
);

export default Logo;
