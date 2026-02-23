import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext, ReactNode } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import Opportunities from './pages/Opportunities';
import Projects from './pages/Projects';
import Solutions from './pages/Solutions';
import Tickets from './pages/Tickets';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';

interface AuthContextType {
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('gavion_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('gavion_token');
  });

  const login = (user: any, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('gavion_user', JSON.stringify(user));
    localStorage.setItem('gavion_token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('gavion_user');
    localStorage.removeItem('gavion_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute><Opportunities /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/solutions" element={<ProtectedRoute><Solutions /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
