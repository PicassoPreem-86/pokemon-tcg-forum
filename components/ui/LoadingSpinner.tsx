'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export default function LoadingSpinner({
  size = 'md',
  className = '',
  text
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className={`pokeball-spinner ${sizeClasses[size]}`}>
        {/* Top half - Red */}
        <div className="pokeball-top" />

        {/* Bottom half - White */}
        <div className="pokeball-bottom" />

        {/* Middle black band */}
        <div className="pokeball-band" />

        {/* Center button */}
        <div className="pokeball-button">
          <div className="pokeball-button-inner" />
        </div>
      </div>

      {text && (
        <p className="text-loading-pulse text-sm font-medium text-text-secondary">
          {text}
        </p>
      )}
    </div>
  );
}
