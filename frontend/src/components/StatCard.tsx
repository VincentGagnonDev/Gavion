import React from 'react';

type StatCardVariant = 'primary' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant?: StatCardVariant;
}

export default function StatCard({ 
  icon, 
  value, 
  label, 
  variant = 'primary' 
}: StatCardProps) {
  const variantClass = `stats-icon ${variant}`;
  
  return (
    <div className="card stats-card">
      <div className={variantClass}>
        {icon}
      </div>
      <div>
        <div className="stats-value">{value}</div>
        <div className="stats-label">{label}</div>
      </div>
    </div>
  );
}
