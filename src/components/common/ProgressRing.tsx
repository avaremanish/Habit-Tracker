import React, { useId } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // hex or gradient id
  secondaryColor?: string;
  showText?: boolean;
  label?: string;
  sublabel?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 140,
  strokeWidth = 10,
  color = '#06b6d4',
  secondaryColor = '#1e2230',
  showText = true,
  label,
  sublabel,
  children,
}) => {
  const rawId = useId();
  const gradientId = `ring-grad-${rawId.replace(/:/g, '')}`;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={secondaryColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="progress-ring-circle transition-all duration-300 ease-out"
        />
      </svg>
      {/* Inner Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {children ? (
          children
        ) : (
          showText && (
            <>
              <span className="text-2xl font-bold tracking-tight text-white font-sans">
                {Math.round(clampedPercentage)}%
              </span>
              {label && <span className="text-[11px] font-medium uppercase tracking-wider text-cyan-400 mt-0.5">{label}</span>}
              {sublabel && <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sublabel}</span>}
            </>
          )
        )}
      </div>
    </div>
  );
};
