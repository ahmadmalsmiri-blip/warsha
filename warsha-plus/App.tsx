
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { db } from './services/firebase';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateRequest from './pages/customer/CreateRequest';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';
import ChatPage from './pages/ChatPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInId = localStorage.getItem('logged_in_user_id');
    if (loggedInId) {
      const u = db.users.getById(loggedInId);
      if (u) setUser(u);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('logged_in_user_id');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={!user ? <Auth onLogin={setUser} /> : <Navigate to={user.role === UserRole.TECHNICIAN ? "/technician" : "/customer"} />} />
          
          {/* Protected Routes */}
          {user && (
            <>
              <Route path="/profile" element={<Profile user={user} onUpdateUser={setUser} />} />
              <Route path="/chat/:requestId" element={<ChatPage user={user} />} />
              
              {user.role === UserRole.CUSTOMER && (
                <>
                  <Route path="/customer" element={<CustomerDashboard user={user} />} />
                  <Route path="/customer/new" element={<CreateRequest user={user} />} />
                </>
              )}
              {user.role === UserRole.TECHNICIAN && (
                <>
                  <Route path="/technician" element={<TechnicianDashboard user={user} />} />
                </>
              )}
              {user.role === UserRole.ADMIN && (
                <>
                  <Route path="/admin" element={<AdminDashboard user={user} />} />
                </>
              )}
            </>
          )}

          {/* Catch all redirect based on auth status */}
          <Route path="*" element={<Navigate to={user ? (user.role === UserRole.TECHNICIAN ? "/technician" : "/customer") : "/"} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
