import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';

export default function PatientDashboard() {
  const { currentUser, records, uploadRecord, deleteRecord, t } = useApp();
  const [title, setTitle] = useState('');

  if (!currentUser) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && title) {
      const reader = new FileReader();
      reader.onload = () => {
        uploadRecord(title, reader.result as string);
        setTitle('');
      };
      reader.readAsDataURL(file);
    }
  };

  const myRecords = useMemo(() => {
    const filtered = records.filter(r => r.patientId === currentUser.id);
    const sorted = [...filtered].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return {
      visible: sorted.slice(0, currentUser.recordViewLimit || 10),
      total: filtered.length,
      limit: currentUser.recordViewLimit || 10
    };
  }, [records, currentUser]);

  const hasHiddenRecords = myRecords.total > myRecords.limit;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white p-14 rounded-[4rem] shadow-2xl flex flex-col md:flex-row justify-between items-center overflow-hidden relative border border-white/5">
        <div className="relative z-10 space-y-8 text-center md:text-left">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight">{currentUser.name}</h2>
            <p className="text-emerald-300 text-sm font-black uppercase tracking-[0.2em]">{t('profile')}</p>
          </div>
          <div className="space-y-1 bg-white/10 p-6 rounded-[2rem] backdrop-blur-md border border-white/10 inline-block">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">{t('health_id')}</p>
            <p className="text-5xl font-mono font-black tracking-tighter">{currentUser.healthId}</p>
          </div>
        </div>
        <div className="relative z-10 mt-10 md:mt-0 group">
          <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl transform group-hover:scale-110 transition-transform duration-500">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${currentUser.healthId}&bgcolor=ffffff&color=064e3b`} 
              className="w-40 h-40" 
              alt="QR" 
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-64 -mt-64 blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 bg-white p-12 rounded-[3.5rem] border shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">📂</div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t('medications')}</h3>
            </div>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full border tracking-widest uppercase">
              Limit: {myRecords.limit} Records
            </span>
          </div>
          
          <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-2">
              <label className="ui-label">New Record Label</label>
              <input 
                className="ui-input h-14 bg-white border-slate-200" 
                placeholder="e.g., Blood Test Jan 2024" 
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <label className={`ui-btn w-full py-5 rounded-2xl text-lg transition-all ${title ? 'ui-btn-primary cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
              {title ? 'Choose & Upload Report' : 'Enter Title First'}
              <input type="file" className="hidden" disabled={!title} onChange={handleFile} />
            </label>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {myRecords.visible.length > 0 ? (
              <>
                {myRecords.visible.map(r => (
                  <div key={r.id} className="p-6 bg-white border-2 border-slate-50 hover:border-emerald-200 rounded-[2rem] flex justify-between items-center group transition-all">
                    <div className="flex items-center gap-5 flex-1 truncate pr-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl group-hover:bg-emerald-50 transition-colors">📄</div>
                      <div className="truncate">
                        <p className="font-black text-slate-800 truncate text-lg">{r.title}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{new Date(r.uploadedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <a href={r.fileUrl} download className="ui-btn ui-btn-outline px-6 py-2.5 text-xs font-black">View</a>
                      <button onClick={() => deleteRecord(r.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <span className="text-xl">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {hasHiddenRecords && (
                  <div className="p-10 bg-amber-50 rounded-[2.5rem] border-2 border-dashed border-amber-200 text-center space-y-3">
                    <p className="text-amber-800 font-black text-sm">🔒 {myRecords.total - myRecords.limit} Additional Records Hidden</p>
                    <p className="text-amber-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      Your current view limit is {myRecords.limit} records. <br/>
                      Contact a system administrator to increase your visibility quota.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-black italic text-base">Your digital health vault is empty.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm space-y-10">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl">📉</div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t('vitals')}</h3>
           </div>
           <div className="space-y-6">
             {[ 
               {n: 'BP', v: '120/80', u: 'mmHg', i: '💓'}, 
               {n: 'RBS', v: '6.2', u: 'mmol/L', i: '🩸'}, 
               {n: 'Pulse', v: '72', u: 'bpm', i: '⚡'} 
             ].map(v => (
                <div key={v.n} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2.25rem] border border-transparent hover:border-emerald-100 hover:bg-white transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{v.i}</span>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{v.n}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{v.v}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">{v.u}</p>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group mt-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Pro Tip</p>
              <p className="text-sm font-bold leading-relaxed opacity-80">Keep your health ID QR accessible on your phone for rapid clinical registration.</p>
           </div>
        </div>
      </div>
    </div>
  );
}