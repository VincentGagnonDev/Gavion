import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'default', 
  className = '' 
}: BadgeProps) {
  const variantClass = variant !== 'default' ? `badge-${variant}` : '';
  
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
