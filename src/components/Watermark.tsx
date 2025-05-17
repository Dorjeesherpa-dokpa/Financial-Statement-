
import React from 'react';

const Watermark: React.FC = () => (
  <div className="watermark">
    <svg
      width="300"
      height="300"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 90L50 10L90 90H10Z"
        fill="currentColor"
      />
      <path
        d="M30 70L50 30L70 70H30Z"
        fill="currentColor"
      />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fill="currentColor"
        fontWeight="bold"
        fontSize="8"
      >
        ZETA ENERGY
      </text>
    </svg>
  </div>
);

export default Watermark;
