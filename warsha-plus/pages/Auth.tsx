
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/firebase';
import { JORDAN_PHONE_REGEX } from '../constants';
import { Logo } from '../components/Logo';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.CUSTOMER
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = db.users.getByEmail(formData.email);
        if (user) {
          localStorage.setItem('logged_in_user_id', user.id);
          onLogin(user);
        } else {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      } else {
        if (!JORDAN_PHONE_REGEX.test(formData.phone)) {
          setError('رقم الهاتف الأردني غير صحيح (يجب أن يبدأ بـ 07 ويتكون من 10 أرقام)');
          setLoading(false);
          return;
        }

        if (db.users.getByEmail(formData.email)) {
          setError('هذا البريد الإلكتروني مسجل مسبقاً');
          setLoading(false);
          return;
        }

        const newUser: User = {
          id: `u-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          approved: formData.role === UserRole.CUSTOMER,
        };

        db.users.save(newUser);
        localStorage.setItem('logged_in_user_id', newUser.id);
        onLogin(newUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (email: string) => {
    const user = db.users.getByEmail(email);
    if (user) {
      localStorage.setItem('logged_in_user_id', user.id);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-[32px] shadow-xl w-full max-w-md p-8 border border-slate-100">
        <div className="flex justify-center mb-8">
          <Logo className="w-16 h-16" textClassName="text-4xl" />
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 mb-2">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
          <p className="text-slate-500 font-medium text-sm">أهلاً بك في منصة ورشه+ لخدمات الصيانة</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-8 flex items-center gap-3 border border-red-200 font-bold">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 mr-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold text-sm bg-slate-50 focus:bg-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 mr-1">نوع الحساب</label>
                <select 
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold text-sm bg-slate-50 focus:bg-white"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.CUSTOMER}>زبون (أرغب بطلب خدمة)</option>
                  <option value={UserRole.TECHNICIAN}>فني (أرغب بتقديم خدماتي)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 mr-1">رقم الهاتف</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="07XXXXXXXX"
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold text-sm bg-slate-50 focus:bg-white"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5 mr-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              required 
              placeholder="example@mail.com"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold text-sm bg-slate-50 focus:bg-white"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-slate-900 font-bold text-sm bg-slate-50 focus:bg-white"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 hover:text-slate-900 transition-colors font-bold"
          >
            {isLogin ? (
              <>ليس لديك حساب؟ <span className="text-emerald-600 underline decoration-2 decoration-emerald-200 underline-offset-4">سجل الآن</span></>
            ) : (
              <>لديك حساب بالفعل؟ <span className="text-emerald-600 underline decoration-2 decoration-emerald-200 underline-offset-4">سجل دخولك</span></>
            )}
          </button>
        </div>

        {/* Demo Accounts Section */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <p className="text-center text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase">دخول سريع للحسابات التجريبية</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleDemoLogin('customer@demo.com')}
              className="bg-slate-50 border border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              👤 زبون
            </button>
            <button 
              onClick={() => handleDemoLogin('tech@demo.com')}
              className="bg-slate-50 border border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              👨‍🔧 فني
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
