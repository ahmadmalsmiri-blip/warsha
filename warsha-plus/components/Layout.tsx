
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, UserRole, AppNotification } from '../types';
import { db } from '../services/firebase';
import AiAssistant from './AiAssistant';
import { Logo } from './Logo';

interface LayoutProps {
  user: User | null; // User can now be null (Guest)
  onLogout: () => void;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Handle Dark Mode Logic - Immediate application
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = () => {
      const ntf = db.notifications.getByUser(user.id);
      setNotifications(ntf);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    if (!user) return;
    db.notifications.markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (n: AppNotification) => {
    db.notifications.markAsRead(n.id);
    setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
    setShowNotifications(false);
  };

  const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`));
    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm mb-1 ${
          isActive
            ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20 translate-x-1 dark:bg-emerald-600 dark:shadow-emerald-900/20'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1 dark:text-slate-400 dark:hover:bg-slate-800'
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm animate-enter"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-slate-950 dark:bg-slate-900 text-white transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:transform-none flex flex-col border-l border-slate-800 shadow-2xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-24 flex items-center px-8 border-b border-slate-800/50">
           {/* Logo forced to white text for sidebar */}
           <div className="text-white">
             <Logo className="w-8 h-8" textClassName="text-2xl text-white" />
           </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-8 px-4">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">القائمة الرئيسية</p>
          
          <NavItem to="/" icon="🏠" label="الرئيسية" />
          
          {!user ? (
            // GUEST MENU
            <>
              <NavItem to="/auth" icon="🔐" label="تسجيل الدخول / إنشاء حساب" />
            </>
          ) : (
            // LOGGED IN MENU
            <>
              {user.role === UserRole.CUSTOMER && (
                <>
                  <NavItem to="/customer" icon="📊" label="لوحة التحكم" />
                  <NavItem to="/customer/new" icon="➕" label="طلب جديد" />
                </>
              )}

              {user.role === UserRole.TECHNICIAN && (
                <>
                  <NavItem to="/technician" icon="🔨" label="لوحة الفني" />
                </>
              )}

              {user.role === UserRole.ADMIN && (
                <NavItem to="/admin" icon="🛡️" label="الإدارة" />
              )}
            </>
          )}

          <div className="mt-8">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">الإعدادات</p>
            
            {user && <NavItem to="/profile" icon="⚙️" label="الملف الشخصي" />}
            
            {/* Dark Mode Toggle in Sidebar - Available for EVERYONE */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all font-bold text-sm hover:translate-x-1 dark:hover:bg-slate-800"
            >
              <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
              <span>{isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
            </button>

            {/* Help - Available for EVERYONE */}
             <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all font-bold text-sm hover:translate-x-1 mt-1">
              <span>❓</span>
              <span>المساعدة</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 dark:bg-slate-950/50">
          {user ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-slate-800">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.role === UserRole.CUSTOMER ? 'زبون' : user.role === UserRole.TECHNICIAN ? 'فني' : 'مشرف'}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-300 py-3 rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-red-900/50 active:scale-95"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
             <div className="text-center">
               <p className="text-xs text-slate-500 mb-3">سجل الدخول للوصول لكافة الميزات</p>
               <Link 
                 to="/auth"
                 className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
               >
                 دخول / تسجيل
               </Link>
             </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg active:scale-95 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white hidden sm:block">
              {location.pathname === '/' ? 'الرئيسية' : 
               location.pathname === '/auth' ? 'بوابة الدخول' :
               location.pathname.startsWith('/chat') ? 'المحادثة' : 
               (user?.role === UserRole.CUSTOMER ? 'لوحة تحكم الزبون' : user?.role === UserRole.TECHNICIAN ? 'مساحة العمل' : user?.role === UserRole.ADMIN ? 'الإدارة' : '')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications - Only for logged in users */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400 rounded-xl transition-all relative border border-slate-100 dark:border-slate-800 active:scale-95"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 w-2 h-2 rounded-full border border-white dark:border-slate-900"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute left-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-enter z-50">
                    <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center backdrop-blur-sm">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">التنبيهات</h3>
                      <button onClick={handleMarkAllRead} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">تحديد الكل كمقروء</button>
                    </div>
                    <div className="max-h-[20rem] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-medium">لا توجد تنبيهات</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${!n.read ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{n.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!user && (
               <Link to="/auth" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hidden sm:block">
                 تسجيل الدخول
               </Link>
            )}
          </div>
        </header>

        {/* Page Content with Motion Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-enter">
             {children || <Outlet />}
          </div>
        </main>
      </div>

      {user && <AiAssistant user={user} />}
    </div>
  );
};

export default Layout;
