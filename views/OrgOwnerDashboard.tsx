
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole, UserProfile } from '../types';

const OrgOwnerDashboard: React.FC = () => {
  const { currentUser, organizations, recruitStaff, t } = useApp();
  const [tab, setTab] = useState<'staff' | 'pricing' | 'recruit'>('staff');
  const [recruitmentRole, setRecruitmentRole] = useState<UserRole>(UserRole.MANAGER);

  const myOrg = organizations.find(o => o.ownerId === currentUser?.id);

  if (!myOrg) return <div className="p-10 text-center">Organization not found.</div>;

  const handleRecruitResult = (user: UserProfile) => {
    if (confirm(`${user.name} কে ${recruitmentRole} হিসেবে নিয়োগ দিতে চান?`)) {
      recruitStaff(myOrg.id, user.id, recruitmentRole);
      alert("নিয়োগের আবেদন পাঠানো হয়েছে!");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="ui-card bg-emerald-900 text-white border-none shadow-2xl p-10 flex justify-between items-center overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black">{myOrg.name}</h2>
          <p className="opacity-70 text-sm mt-1 font-bold">{myOrg.location} • {t('org_mgmt')}</p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-[10px] font-bold uppercase text-emerald-300 tracking-widest">Total Capacity</p>
          <p className="text-3xl font-black">{myOrg.beds.length} Beds</p>
        </div>
      </div>

      <div className="flex gap-8 border-b border-slate-200">
        <button onClick={() => setTab('staff')} className={`pb-4 font-bold text-sm transition-all border-b-2 ${tab === 'staff' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}>{t('staff_dashboard')}</button>
        <button onClick={() => setTab('recruit')} className={`pb-4 font-bold text-sm transition-all border-b-2 ${tab === 'recruit' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}>{t('recruit')}</button>
        <button onClick={() => setTab('pricing')} className={`pb-4 font-bold text-sm transition-all border-b-2 ${tab === 'pricing' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400'}`}>{t('pricing_mgmt')}</button>
      </div>

      {tab === 'staff' && (
        <div className="ui-card p-0 overflow-hidden shadow-sm border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b">
              <tr>
                <th className="px-8 py-5 ui-label">Name / Health ID</th>
                <th className="px-8 py-5 ui-label">Role</th>
                <th className="px-8 py-5 ui-label">Status</th>
                <th className="px-8 py-5 ui-label">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrg.staff.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-800 tracking-tight">User ID: {s.userId}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-lg uppercase tracking-wider">{s.role}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`ui-badge ${s.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-red-500 hover:text-red-700 transition-colors text-xs font-black uppercase tracking-widest">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myOrg.staff.length === 0 && <div className="p-20 text-center text-slate-300 italic font-medium">No staff members found.</div>}
        </div>
      )}

      {tab === 'recruit' && (
        <div className="space-y-8 animate-in slide-in-from-top-4">
           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-xl space-y-8">
             <div className="max-w-md space-y-2">
                <label className="ui-label text-emerald-700">পদবি নির্বাচন করুন (Role to Assign)</label>
                <select className="ui-input h-14 font-bold text-slate-700" value={recruitmentRole} onChange={e => setRecruitmentRole(e.target.value as UserRole)}>
                   <option value={UserRole.MANAGER}>Manager</option>
                   <option value={UserRole.ASSISTANT_MANAGER}>Assistant Manager</option>
                   <option value={UserRole.NURSE}>Nurse</option>
                   <option value={UserRole.PATHOLOGIST}>Pathologist</option>
                   <option value={UserRole.LAB_TECHNICIAN}>Lab Technician</option>
                </select>
             </div>
             
             <div className="space-y-4">
                <p className="ui-label">স্টাফ খুঁজুন (আইডি বা মোবাইল দিয়ে)</p>
                <RecruitSearch onResult={handleRecruitResult} />
             </div>
           </div>
        </div>
      )}

      {tab === 'pricing' && (
        <div className="ui-card space-y-6 shadow-sm border-slate-100">
           <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">Investigation Pricing Chart</h3>
              <button className="ui-btn ui-btn-primary py-3">+ Add Service</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {myOrg.pricing.map(p => (
               <div key={p.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-white transition-all group">
                 <span className="font-bold text-slate-700">{p.investigationName}</span>
                 <div className="flex items-center gap-4">
                    <span className="text-emerald-700 font-black">৳{p.price}</span>
                    <button className="text-slate-200 hover:text-red-500 transition-colors">✖</button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

const RecruitSearch = ({ onResult }: { onResult: (user: UserProfile) => void }) => {
  const { users, t } = useApp();
  const [query, setQuery] = useState('');

  const found = query.length > 2 
    ? users.filter(u => u.healthId.toLowerCase().includes(query.toLowerCase()) || u.phone.includes(query)) 
    : [];

  return (
    <div className="space-y-6">
      <div className="relative">
        <input 
          type="text" 
          placeholder={t('search_placeholder')}
          className="ui-input h-14 pl-12 font-medium" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
      </div>
      
      {found.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
          {found.map(u => (
            <div 
              key={u.id} 
              onClick={() => onResult(u)} 
              className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 flex items-center gap-5 hover:border-emerald-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer transition-all group"
            >
              <img 
                src={u.photoUrl} 
                className="w-16 h-16 rounded-2xl shadow-sm border-2 border-slate-50" 
                alt={u.name} 
              />
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 truncate group-hover:text-emerald-700">{u.name}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{u.gender}</span>
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{u.age}Y</span>
                </div>
                <p className="text-[10px] font-mono font-bold text-emerald-600 mt-2">{u.healthId}</p>
                <p className="text-[9px] text-slate-400 font-bold">{u.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgOwnerDashboard;
