import React from 'react';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            {[1, 2, 3, 4, 5].map(i => (
              <th key={i} className="skeleton-header" style={{ height: '1rem', width: '80px' }} />
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <td key={colIndex} className="skeleton-cell" style={{ height: '1rem' }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div className="skeleton animate-pulse" style={{ 
        height: '1.25rem', 
        width: '60%', 
        marginBottom: '1rem',
        background: 'var(--border)',
        borderRadius: '0.25rem'
      }} />
      <div className="skeleton animate-pulse" style={{ 
        height: '2.5rem', 
        width: '100%', 
        background: 'var(--border)',
        borderRadius: '0.25rem'
      }} />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card stats-card">
      <div className="stats-icon" style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '0.5rem',
        background: 'var(--border)',
        marginBottom: '1rem'
      }} />
      <div>
        <div className="skeleton animate-pulse" style={{ 
          height: '1.5rem', 
          width: '60px', 
          marginBottom: '0.5rem',
          background: 'var(--border)',
          borderRadius: '0.25rem'
        }} />
        <div className="skeleton animate-pulse" style={{ 
          height: '1rem', 
          width: '80px',
          background: 'var(--border)',
          borderRadius: '0.25rem'
        }} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="skeleton animate-pulse" style={{ 
          height: '1.5rem', 
          width: '200px', 
          marginBottom: '0.5rem',
          background: 'var(--border)',
          borderRadius: '0.25rem'
        }} />
        <div className="skeleton animate-pulse" style={{ 
          height: '1rem', 
          width: '300px',
          background: 'var(--border)',
          borderRadius: '0.25rem'
        }} />
      </div>
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
      </div>
      <div className="card" style={{ minHeight: '300px' }}>
        <div className="skeleton animate-pulse" style={{ 
          height: '2rem', 
          width: '150px', 
          marginBottom: '1rem',
          background: 'var(--border)',
          borderRadius: '0.25rem'
        }} />
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}
