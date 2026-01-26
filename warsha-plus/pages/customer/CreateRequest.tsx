
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RequestStatus, ServiceRequest } from '../../types';
import { db } from '../../services/firebase';
import { CATEGORIES, CITIES } from '../../constants';
import { geminiService } from '../../services/gemini';

const CreateRequest: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: CATEGORIES[0].name,
    description: '',
    city: CITIES[0],
    preferredTime: ''
  });

  const handleEnhance = async () => {
    if (!formData.description) return;
    setLoading(true);
    const enhanced = await geminiService.enhanceDescription(formData.description);
    setFormData({ ...formData, description: enhanced || formData.description });
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      category: formData.category,
      description: formData.description,
      city: formData.city,
      preferredTime: formData.preferredTime,
      status: RequestStatus.OPEN,
      createdAt: Date.now()
    };

    db.requests.save(newReq);
    setTimeout(() => {
      navigate('/customer');
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-emerald-100 dark:border-slate-800 transition-colors">
        <h1 className="text-3xl font-bold text-blue-950 dark:text-white mb-2">طلب خدمة جديد</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">املأ البيانات التالية وسيتواصل معك الفنيون في أقرب وقت.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المجال</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف المشكلة</label>
            <div className="relative">
              <textarea 
                required
                rows={4}
                placeholder="اشرح المشكلة التي تواجهك بالتفصيل..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
              <button 
                type="button"
                onClick={handleEnhance}
                className="absolute left-3 bottom-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:text-emerald-600 transition-all flex items-center gap-1"
                title="تحسين الوصف بالذكاء الاصطناعي"
              >
                ✨ تحسين الوصف
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموعد المفضل</label>
            <input 
              type="text" 
              placeholder="مثال: غداً الساعة 4 عصراً"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              value={formData.preferredTime}
              onChange={e => setFormData({...formData, preferredTime: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">صورة المشكلة (اختياري)</label>
            <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-all">
              <input type="file" className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-4xl block mb-2">📸</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">اضغط هنا لرفع صورة للمشكلة</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all transform active:scale-95 shadow-xl shadow-emerald-100 dark:shadow-none disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'نشر الطلب الآن'}
            </button>
            <button 
              type="button"
              onClick={() => navigate('/customer')}
              className="px-8 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
