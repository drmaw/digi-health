
import React from 'react';
import { useApp } from '../store';

export default function PatientDashboard() {
  const { currentUser, t } = useApp();
  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-black">{currentUser.name}</h2>
              <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest mt-1">Certified Citizen Patient</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('health_id')}</p>
              <p className="text-3xl font-mono font-black tracking-tighter">{currentUser.healthId}</p>
            </div>
            <div className="pt-4 flex gap-10">
              <div><p className="text-[10px] opacity-60 uppercase font-black">Blood Group</p><p className="font-bold text-xl">{currentUser.bloodGroup || 'N/A'}</p></div>
              <div><p className="text-[10px] opacity-60 uppercase font-black">Contact</p><p className="font-bold text-xl">{currentUser.phone}</p></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-2xl">
             <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl font-black">QR CARD</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-emerald-600">📂</span> {t('medications')}
            </h3>
            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-slate-400">
              No current medications listed.
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-emerald-600">📅</span> {t('appointments')}
            </h3>
            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-slate-400">
              No upcoming appointments.
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-red-500">🚩</span> {t('red_flag')}
            </h3>
            {currentUser.redFlag?.isPresent ? (
              <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-100 animate-pulse">
                 <p className="text-sm font-bold">{currentUser.redFlag.comment}</p>
              </div>
            ) : <p className="text-slate-400 italic text-sm text-center">No alerts recorded.</p>}
          </div>
          
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-emerald-600">📉</span> {t('vitals')}
            </h3>
            <div className="space-y-4">
              {[ {n: 'BP', v: '120/80', u: 'mmHg'}, {n: 'RBS', v: '6.2', u: 'mmol/L'}, {n: 'Pulse', v: '72', u: 'bpm'} ].map(v => (
                <div key={v.n} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <span className="text-xs font-black text-slate-500 uppercase">{v.n}</span>
                  <div className="text-right">
                    <p className="text-sm font-black">{v.v}</p>
                    <p className="text-[8px] text-slate-400 font-bold">{v.u}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
