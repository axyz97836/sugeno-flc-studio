import React from 'react';

export function Icon({ name, className = 'w-4 h-4', stroke = 'currentColor', ...props }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: '1.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  };

  switch (name) {
    case 'restaurant':
    case 'dining':
      return (
        <svg {...common}>
          <path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v7a3 3 0 0 0 3 3h1V3M18 13v8" />
        </svg>
      );

    case 'ac':
    case 'climate':
      return (
        <svg {...common}>
          <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13M12 8l-2-2M12 16l2 2M8 12l-2 2M16 12l2-2" />
        </svg>
      );

    case 'washing-machine':
    case 'washer':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <circle cx="12" cy="13" r="4" />
          <path d="M8 7h.01M11 7h2" />
        </svg>
      );

    case 'setup':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16M8 4v4M16 10v4M10 16v4" />
        </svg>
      );

    case 'fuzzify':
      return (
        <svg {...common}>
          <path d="M3 19h18M4 19l8-14 8 14M12 5v14" />
        </svg>
      );

    case 'rules':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 10h16M4 16h16M10 4v16M16 4v16" />
        </svg>
      );

    case 'compute':
      return (
        <svg {...common}>
          <path d="M18 5H6l6 7-6 7h12" />
        </svg>
      );

    case 'defuzzify':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        </svg>
      );

    case 'play':
      return (
        <svg {...common}>
          <polygon points="7 4 19 12 7 20 7 4" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'pause':
      return (
        <svg {...common}>
          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'stepBack':
      return (
        <svg {...common}>
          <path d="M6 5v14M18 5l-10 7 10 7V5z" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'stepForward':
      return (
        <svg {...common}>
          <path d="M18 5v14M6 5l10 7-10 7V5z" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'reset':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'sidebar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      );

    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );

    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M6 18L18 6" />
        </svg>
      );

    case 'chevronDown':
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );

    case 'chevronUp':
      return (
        <svg {...common}>
          <path d="M18 15l-6-6-6 6" />
        </svg>
      );

    case 'github':
      return (
        <svg {...common}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
