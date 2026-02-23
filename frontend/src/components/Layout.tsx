import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, TrendingUp, Briefcase, 
  Package, FolderKanban, Headphones, BarChart3, LogOut 
} from 'lucide-react';
import { useAuth } from '../App';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/leads', icon: TrendingUp, label: 'Leads' },
  { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/solutions', icon: Package, label: 'Solutions' },
  { to: '/tickets', icon: Headphones, label: 'Support' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Gavion</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI-Powered CRM</div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 500 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
