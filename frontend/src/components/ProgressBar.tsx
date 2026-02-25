import React from 'react';

type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger';

interface ProgressBarProps {
  percent: number;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ 
  percent, 
  variant = 'default', 
  showLabel = false,
  className = ''
}: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  
  const variantColors: Record<ProgressBarVariant, string> = {
    default: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  };

  return (
    <div className={`progress-bar-container ${className}`}>
      <div 
        className="progress-bar"
        style={{
          width: `${clampedPercent}%`,
          backgroundColor: variantColors[variant]
        }}
      />
      {showLabel && (
        <div className="progress-label">{clampedPercent}%</div>
      )}
    </div>
  );
}
