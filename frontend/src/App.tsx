import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import Login from './pages/Login';
import { PageSkeleton } from './components/Skeleton';
import Layout from './components/Layout';
import ClientLayout from './components/ClientLayout';
import type { User } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const isClientUser = (user: User | null): boolean => {
  return user?.role === 'CLIENT_ADMIN' || user?.role === 'CLIENT_USER';
};

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientsAdd = lazy(() => import('./pages/ClientsAdd'));
const ClientsDetail = lazy(() => import('./pages/ClientsDetail'));
const Leads = lazy(() => import('./pages/Leads'));
const LeadsAdd = lazy(() => import('./pages/LeadsAdd'));
const LeadsDetail = lazy(() => import('./pages/LeadsDetail'));
const Opportunities = lazy(() => import('./pages/Opportunities'));
const OpportunitiesAdd = lazy(() => import('./pages/OpportunitiesAdd'));
const OpportunitiesDetail = lazy(() => import('./pages/OpportunitiesDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectsAdd = lazy(() => import('./pages/ProjectsAdd'));
const ProjectsDetail = lazy(() => import('./pages/ProjectsDetail'));
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketsAdd = lazy(() => import('./pages/TicketsAdd'));
const TicketsDetail = lazy(() => import('./pages/TicketsDetail'));
const Solutions = lazy(() => import('./pages/Solutions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Invoices = lazy(() => import('./pages/Invoices'));

const ClientPortalDashboard = lazy(() => import('./pages/ClientPortalDashboard'));
const ClientInvoices = lazy(() => import('./pages/ClientInvoices'));
const ClientSolutions = lazy(() => import('./pages/ClientSolutions'));
const ClientTickets = lazy(() => import('./pages/ClientTickets'));
const ClientCompany = lazy(() => import('./pages/ClientCompany'));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (isClientUser(user)) {
    return <Navigate to="/portal" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function ClientProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isClientUser(user)) {
    return <Navigate to="/" replace />;
  }
  
  return <ClientLayout>{children}</ClientLayout>;
}

function App() {
  // Check for existing session on mount
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Check for token in cookies (backend sets HTTP-only cookie)
    // For now, we'll check if there's a token from a previous login
    // In production, we rely on the refresh token cookie
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a valid session
    // In a real app, you'd validate the token with the backend here
    // For now, we just check localStorage for the token (temporary)
    const savedToken = localStorage.getItem('gavion_token');
    const savedUser = localStorage.getItem('gavion_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('gavion_token', token);
    localStorage.setItem('gavion_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side session
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('gavion_token');
    localStorage.removeItem('gavion_user');
  };

  if (isLoading) {
    return (
      <div className="app">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </Suspense>
          } />
           <Route path="/clients" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Clients /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/clients/new" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><ClientsAdd /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/clients/:id" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><ClientsDetail /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/leads" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Leads /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/leads/new" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><LeadsAdd /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/leads/:id" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><LeadsDetail /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/opportunities" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Opportunities /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/opportunities/new" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><OpportunitiesAdd /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/opportunities/:id" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><OpportunitiesDetail /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/projects" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Projects /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/projects/new" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><ProjectsAdd /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/projects/:id" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><ProjectsDetail /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/tickets" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Tickets /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/tickets/new" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><TicketsAdd /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/tickets/:id" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><TicketsDetail /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/solutions" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Solutions /></ProtectedRoute>
             </Suspense>
           } />
          <Route path="/leads" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Leads /></ProtectedRoute>
            </Suspense>
          } />
          <Route path="/opportunities" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Opportunities /></ProtectedRoute>
            </Suspense>
          } />
          <Route path="/projects" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Projects /></ProtectedRoute>
            </Suspense>
          } />
          <Route path="/solutions" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Solutions /></ProtectedRoute>
            </Suspense>
          } />
           <Route path="/tickets" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Tickets /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/tickets/new" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><TicketsAdd /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/tickets/:id" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><TicketsDetail /></ProtectedRoute>
             </Suspense>
           } />
           <Route path="/analytics" element={
             <Suspense fallback={<PageSkeleton />}>
               <ProtectedRoute><Analytics /></ProtectedRoute>
             </Suspense>
           } />
          <Route path="/quotes" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Quotes /></ProtectedRoute>
            </Suspense>
          } />
          <Route path="/invoices" element={
            <Suspense fallback={<PageSkeleton />}>
              <ProtectedRoute><Invoices /></ProtectedRoute>
            </Suspense>
          } />
          
          <Route path="/portal" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientProtectedRoute><ClientPortalDashboard /></ClientProtectedRoute>
            </Suspense>
          } />
          <Route path="/portal/invoices" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientProtectedRoute><ClientInvoices /></ClientProtectedRoute>
            </Suspense>
          } />
          <Route path="/portal/subscriptions" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientProtectedRoute><ClientInvoices /></ClientProtectedRoute>
            </Suspense>
          } />
          <Route path="/portal/solutions" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientProtectedRoute><ClientSolutions /></ClientProtectedRoute>
            </Suspense>
          } />
          <Route path="/portal/tickets" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientProtectedRoute><ClientTickets /></ClientProtectedRoute>
            </Suspense>
          } />
          <Route path="/portal/company" element={
            <Suspense fallback={<PageSkeleton />}>
              <ClientProtectedRoute><ClientCompany /></ClientProtectedRoute>
            </Suspense>
          } />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
