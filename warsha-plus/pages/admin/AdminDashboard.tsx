
import React, { useState, useEffect } from 'react';
import { User, UserRole, ServiceRequest, RequestStatus } from '../../types';
import { db } from '../../services/firebase';

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'techs' | 'requests'>('techs');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const allUsers = db.users.getAll();
    setTechnicians(allUsers.filter(u => u.role === UserRole.TECHNICIAN));
    setRequests(db.requests.getAll().sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleApprove = (techId: string) => {
    const tech = db.users.getById(techId);
    if (tech) {
      tech.approved = true;
      db.users.save(tech);
      refreshData();
      alert('تم اعتماد الفني بنجاح!');
    }
  };

  const handleDecline = (techId: string) => {
    const allUsers = db.users.getAll().filter(u => u.id !== techId);
    localStorage.setItem('wp_users', JSON.stringify(allUsers));
    refreshData();
    alert('تم حذف طلب الفني.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المشرف</h1>
        <div className="flex bg-white p-1 rounded-2xl border shadow-sm">
          <button 
            onClick={() => setActiveTab('techs')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'techs' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            الفنيين الجدد
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            إدارة الطلبات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">إجمالي الفنيين</p>
          <p className="text-3xl font-extrabold text-orange-600">{technicians.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">الطلبات النشطة</p>
          <p className="text-3xl font-extrabold text-blue-600">{requests.filter(r => r.status === RequestStatus.OPEN).length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">المهمات المكتملة</p>
          <p className="text-3xl font-extrabold text-green-600">{requests.filter(r => r.status === RequestStatus.COMPLETED).length}</p>
        </div>
      </div>

      {activeTab === 'techs' ? (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">الاسم</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">الهاتف</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">الحالة</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {technicians.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">لا يوجد فنيون مسجلون</td></tr>
              ) : (
                technicians.map(tech => (
                  <tr key={tech.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{tech.name}</div>
                      <div className="text-xs text-gray-500">{tech.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{tech.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${tech.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tech.approved ? 'معتمد' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!tech.approved && (
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleApprove(tech.id)}
                            className="bg-green-600 text-white px-4 py-1 rounded-lg text-xs font-bold hover:bg-green-700 transition-all"
                          >
                            موافقة
                          </button>
                          <button 
                            onClick={() => handleDecline(tech.id)}
                            className="bg-red-50 text-red-600 px-4 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">الطلب</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">الزبون</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">الحالة</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{req.category}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{req.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{req.customerName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      req.status === RequestStatus.OPEN ? 'bg-green-100 text-green-700' :
                      req.status === RequestStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString('ar-JO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
