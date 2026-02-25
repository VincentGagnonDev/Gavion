import { useState, useEffect } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { solutions } from '../services/api';
import type { AISolution } from '../types';
import { PageSkeleton } from '../components/Skeleton';

const categoryIcons: Record<string, string> = {
  automation: '⚙️',
  predictive: '📊',
  analytics: '📈',
  nlp: '💬',
  vision: '👁️',
  custom: '🔧',
  consulting: '💡'
};

export default function Solutions() {
  const [solutionsList, setSolutionsList] = useState<AISolution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSolutions = async () => {
    try {
      const data = await solutions.getAll();
      setSolutionsList(data || []);
    } catch (error) {
      console.error('Failed to load solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolutions();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">AI Solutions</h1>
          <p className="page-subtitle">Explore Gavion's AI-powered solutions</p>
        </div>
        <div className="grid grid-3">
          {[1,2,3].map(i => (
            <div key={i} className="card" style={{ minHeight: '250px' }}>
              <div className="skeleton animate-pulse" style={{ 
                height: '3rem', 
                width: '3rem', 
                marginBottom: '0.5rem',
                background: 'var(--border)',
                borderRadius: '0.5rem'
              }} />
              <div className="skeleton animate-pulse" style={{ 
                height: '1.5rem', 
                width: '80%', 
                marginBottom: '0.5rem',
                background: 'var(--border)',
                borderRadius: '0.25rem'
              }} />
              <div className="skeleton animate-pulse" style={{ 
                height: '5rem', 
                width: '100%', 
                marginBottom: '1rem',
                background: 'var(--border)',
                borderRadius: '0.25rem'
              }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Solutions</h1>
        <p className="page-subtitle">Explore Gavion's AI-powered solutions and services</p>
      </div>

      <div className="grid grid-3">
        {solutionsList.map(solution => (
          <div key={solution.id} className="card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {categoryIcons[solution.category] || '🔬'}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {solution.name}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {solution.description || solution.tagline}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
              {solution.targetIndustries?.slice(0, 3).map((industry, i) => (
                <span key={i} style={{ 
                  background: 'var(--background)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem'
                }}>
                  {industry}
                </span>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              Learn More <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Request a Consultation
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Not sure which solution is right for you? Our team can help assess your needs and recommend the best approach.
        </p>
        <button className="btn btn-primary">
          Schedule Consultation
        </button>
      </div>
    </div>
  );
}
