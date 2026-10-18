import { useId } from 'react';
import './GradientText.css';

export function GradientText({ children, className = '', animationSpeed = 5, showBorder = false }) {
  const uid = useId().replaceAll(':', '');
  return (
    <span className={`gradient-text ${showBorder ? 'gradient-text--border' : ''} ${className}`}
      style={{ '--gradient-duration': `${animationSpeed}s` }}>
      <svg className="gradient-text__svg" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`gradient-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffaa40" />
            <stop offset="50%" stopColor="#9c40ff" />
            <stop offset="100%" stopColor="#ffaa40" />
          </linearGradient>
          <linearGradient id={`border-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffaa40" />
            <stop offset="50%" stopColor="#9c40ff" />
            <stop offset="100%" stopColor="#ffaa40" />
          </linearGradient>
        </defs>
      </svg>
      <span className="gradient-text__content">{children}</span>
      {showBorder && <span className="gradient-text__border" aria-hidden="true" />}
    </span>
  );
}
