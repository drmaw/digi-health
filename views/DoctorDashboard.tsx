
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserProfile } from '../types';

export default function DoctorDashboard() {
  const { users, updateUser, t } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UserProfile | null>(null);

  const found = query.length > 2 
    ? users.filter(u => u.healthId.includes(query) || u.phone.includes(query)) 
    : [];

  const handleSelect = (user: UserProfile) => {
    setSelected(user);
    setQuery(''); // Clear search after selection
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <span className="text-emerald-600">🩺</span> রোগী অনুসন্ধান (ডক্টর প্যানেল)
        </h2>
        <div className="flex gap-2">
          <input 
            className="flex-1 p-5 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
            placeholder={t('search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="bg-slate-900 text-white p-5 rounded-2xl hover:bg-slate-800 transition-colors">📸</button>
        </div>
        
        {found.length > 0 && (
          <div className="mt-8 space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">সার্চ রেজাল্ট ({found.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {found.map(u => (
                <div 
                  key={u.id} 
                  onClick={() => handleSelect(u)}
                  className="group flex items-center gap-4 p-5 bg-slate-50 border-2 border-transparent hover:border-emerald-500 hover:bg-white rounded-[2rem] cursor-pointer transition-all shadow-sm hover:shadow-xl"
                >
                  <img 
                    src={u.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} 
                    className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100" 
                    alt={u.name} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate group-hover:text-emerald-700">{u.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{u.gender}</span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{u.age} Years</span>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-emerald-600 mt-2">{u.healthId}</p>
                    <p className="text-[9px] font-bold text-slate-400">{u.phone}</p>
                  </div>
                  {u.redFlag?.isPresent && <span className="text-xl animate-bounce">🚩</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white p-10 rounded-[3rem] border shadow-2xl animate-in slide-in-from-bottom-6 border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div className="flex items-center gap-6">
               <img 
                 src={selected.photoUrl} 
                 className="w-24 h-24 rounded-[2rem] border-4 border-emerald-50 shadow-lg" 
                 alt={selected.name} 
               />
               <div>
                 <h3 className="text-3xl font-black text-slate-900">{selected.name}</h3>
                 <p className="text-emerald-600 font-bold font-mono text-lg">{selected.healthId}</p>
               </div>
            </div>
            <button 
              onClick={() => {
                const comment = prompt('সতর্কতা বার্তা বা রোগের নাম লিখুন:');
                if (comment) updateUser({...selected, redFlag: { isPresent: true, comment }});
              }}
              className="ui-btn bg-red-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700"
            >
              🚩 রেড ফ্ল্যাগ সেট করুন
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <p className="ui-label text-slate-400 mb-2">ডাক্তারের মন্তব্য (Medical Note)</p>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[100px]">
                <p className="text-slate-700 font-medium leading-relaxed">
                  {selected.redFlag?.comment || 'কোনো রোগের মন্তব্য রেকর্ড করা নেই।'}
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
              <p className="ui-label text-slate-400">ব্যক্তিগত তথ্য</p>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-2xl border shadow-sm">
                   <p className="text-[10px] text-slate-400 font-black uppercase">Age</p>
                   <p className="font-bold text-slate-800">{selected.age} Years</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border shadow-sm">
                   <p className="text-[10px] text-slate-400 font-black uppercase">Gender</p>
                   <p className="font-bold text-slate-800">{selected.gender}</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border shadow-sm col-span-2">
                   <p className="text-[10px] text-slate-400 font-black uppercase">Mobile</p>
                   <p className="font-bold text-slate-800">{selected.phone}</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
