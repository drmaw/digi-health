
import React from 'react';
import { useApp } from '../store';

export default function StaffDashboard() {
  const { currentUser, organizations, t } = useApp();
  const org = organizations[0]; // Simplified: use first org

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-emerald-900 text-white p-8 rounded-3xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">{org.name}</h2>
          <p className="text-emerald-400 font-bold">{t('staff_dashboard')}</p>
        </div>
        <p className="text-xs font-bold bg-emerald-800 px-3 py-1 rounded-full uppercase">{currentUser?.activeRoles[0]}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="font-black mb-6">বেড ম্যানেজমেন্ট</h3>
          <div className="grid grid-cols-4 gap-3">
            {org.beds.map(b => (
              <div key={b.id} className={`p-4 rounded-xl border-2 text-center text-[10px] font-black ${b.isOccupied ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-50 bg-emerald-50 text-emerald-600'}`}>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-4">
          <h3 className="font-black mb-2">দ্রুত লিঙ্ক</h3>
          <button className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-left hover:bg-emerald-50 transition">📝 নতুন ভর্তি</button>
          <button className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-left hover:bg-emerald-50 transition">🧪 টেস্ট রিপোর্ট আপলোড</button>
          <button className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-left hover:bg-emerald-50 transition">📋 মেডিসিন শিডিউল</button>
        </div>
      </div>
    </div>
  );
}
