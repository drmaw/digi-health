import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, Appointment, Organization } from '../types';
import { ProfileCard } from '../components/ProfileCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { QRScannerModal } from '../components/QRScannerModal';

export default function DoctorDashboard() {
  const { users, currentUser, organizations, appointments, updateUser, t, addLog } = useApp();
  const [viewMode, setViewMode] = useState<'console' | 'roster'>('roster');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [pending, setPending] = useState<UserProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const myChambers = useMemo(() => {
    return organizations.filter(org => 
      org.staff.some(s => s.userId === currentUser?.id) || org.ownerId === currentUser?.id
    );
  }, [organizations, currentUser]);

  const searchResults = query.length > 2 
    ? users.filter(u => u.healthId.includes(query) || u.phone.includes(query)) 
    : [];

  const handleConfirm = () => {
    if (pending) {
      setSelected(pending);
      addLog('PATIENT_DATA_VIEWED', `Doctor accessed patient profile: ${pending.name}`, { targetType: 'User', targetId: pending.id, targetName: pending.name });
      setPending(null);
      setQuery('');
      setViewMode('console');
    }
  };

  const selectPatientFromRoster = (healthId: string) => {
    const patient = users.find(u => u.healthId === healthId);
    if (patient) {
      setPending(patient);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in pb-32">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3rem] border shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-emerald-200">🩺</div>
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{currentUser?.name}</h1>
              {currentUser?.degrees && (
                <span className="text-sm font-bold text-emerald-600">{currentUser.degrees}</span>
              )}
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
              {currentUser?.specialty || t('doctor')} • Diagnostic Console & Roster
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-2 rounded-[2rem] border shadow-inner">
          <button 
            onClick={() => setViewMode('roster')}
            className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'roster' ? 'bg-white text-emerald-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            📋 {t('chamber_roster')}
          </button>
          <button 
            onClick={() => setViewMode('console')}
            className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'console' ? 'bg-white text-emerald-700 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            🧪 {t('clinical_console')}
          </button>
        </div>
      </div>

      {viewMode === 'roster' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 animate-in slide-in-from-bottom-8 duration-700">
          {myChambers.map(chamber => (
            <ChamberCard 
              key={chamber.id} 
              org={chamber} 
              appointments={appointments.filter(a => a.orgId === chamber.id && a.doctorId === currentUser?.id)}
              users={users}
              onSelectPatient={selectPatientFromRoster}
              t={t}
            />
          ))}
          {myChambers.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
               <p className="text-slate-300 font-black italic text-xl">No active chambers assigned to your profile.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm space-y-10">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t('clinical_console')}</h3>
               <button onClick={() => setIsScanning(true)} className="ui-btn ui-btn-primary py-4 px-8 text-sm">
                 <span>📷</span> Scan Health ID
               </button>
            </div>
            <div className="relative group">
              <input 
                className="ui-input h-16 pl-14 text-xl font-bold bg-white focus:bg-white"
                placeholder={t('search_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
            {searchResults.length > 0 && !selected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {searchResults.map(u => <ProfileCard key={u.id} user={u} onClick={() => setPending(u)} />)}
              </div>
            )}
          </div>

          {selected ? (
            <div className="bg-white p-14 rounded-[4rem] border shadow-2xl animate-in zoom-in-95 duration-500 space-y-16">
              <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <img src={selected.photoUrl} className="w-32 h-32 rounded-[2.5rem] border-8 border-emerald-50 shadow-xl group-hover:rotate-3 transition-transform" alt="" />
                    {selected.redFlag?.isPresent && (
                      <span className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg animate-bounce border-4 border-white">🚩</span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2">Patient Profile</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selected.name}</h3>
                    <div className="mt-3 bg-emerald-50 px-5 py-2 rounded-2xl inline-block border border-emerald-100/50">
                      <p className="text-emerald-700 font-mono font-black text-2xl tracking-tighter">{selected.healthId}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-red-500 transition-colors font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  ✖ Close Session
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 space-y-10">
                  <h4 className="ui-label text-slate-400">Biological Metrics</h4>
                  <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Current Age</p>
                        <p className="font-black text-slate-800 text-2xl">{selected.age} Years</p>
                      </div>
                      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Blood Type</p>
                        <p className="font-black text-slate-800 text-2xl">{selected.bloodGroup}</p>
                      </div>
                      <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm col-span-2">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contact Access</p>
                        <p className="font-black text-slate-800 text-2xl">{selected.phone}</p>
                      </div>
                  </div>
                   
                  {selected.redFlag?.isPresent && (
                    <div className="bg-red-50 p-8 rounded-[2.5rem] border-2 border-red-100 flex gap-6 items-center">
                      <div className="text-5xl">🚩</div>
                      <div>
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Clinical Red Flag</p>
                        <p className="text-lg font-bold text-red-900 leading-snug">{selected.redFlag.comment}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="ui-label text-slate-400">Red Flag Alert System</h4>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest animate-pulse">Critical Field</span>
                  </div>
                  <textarea 
                    className="ui-input bg-white h-80 py-8 resize-none font-medium leading-relaxed text-lg rounded-[2.5rem] border-rose-50 focus:border-rose-300"
                    placeholder="Set public clinical red flag warnings (e.g. Drug Allergies, Chronic Conditions)..."
                    defaultValue={selected.redFlag?.comment}
                    onBlur={(e) => {
                      updateUser({ ...selected, redFlag: { isPresent: !!e.target.value, comment: e.target.value } });
                      addLog('MEDICAL_UPDATE', 'Doctor updated red flag status', { targetType: 'User', targetId: selected.id, targetName: selected.name });
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100">📝</div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800 tracking-tight">Clinical Observations & Internal Notes</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Only visible to medical staff during consultation</p>
                    </div>
                  </div>
                </div>

                <textarea 
                  className="ui-input bg-white h-96 py-10 px-10 resize-none font-medium leading-relaxed text-xl rounded-[3rem] shadow-sm focus:shadow-2xl transition-all"
                  placeholder="Enter patient symptoms, diagnosis details, internal clinical observations, and follow-up plan..."
                  defaultValue={selected.doctorNotes}
                  onBlur={(e) => {
                    updateUser({ ...selected, doctorNotes: e.target.value });
                    addLog('INTERNAL_NOTE_UPDATE', 'Doctor updated internal notes', { targetType: 'User', targetId: selected.id, targetName: selected.name });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
               <div className="text-7xl mb-6 grayscale opacity-20">🧬</div>
               <h3 className="text-2xl font-black text-slate-300">No Patient Profile Loaded</h3>
               <p className="text-slate-400 font-bold mt-2">Search or scan a Health ID to begin clinical documentation.</p>
            </div>
          )}
        </div>
      )}

      {isScanning && <QRScannerModal onScan={id => { setPending(users.find(u => u.healthId === id) || null); setIsScanning(false); }} onClose={() => setIsScanning(false)} />}
      {pending && <ConfirmationModal user={pending} onConfirm={handleConfirm} onCancel={() => setPending(null)} />}
    </div>
  );
}

const ChamberCard = ({ org, appointments, users, onSelectPatient, t }: { org: Organization, appointments: Appointment[], users: UserProfile[], onSelectPatient: (id: string) => void, t: any }) => {
  return (
    <div className="bg-white rounded-[4rem] border shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="p-12 bg-slate-50 border-b space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">🏢</div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{org.name}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{org.location}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-12 flex-1 space-y-10">
        <div className="flex justify-between items-center">
          <h4 className="ui-label text-slate-400 m-0">{t('chamber_appointments')}</h4>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Queue: {appointments.length}</span>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {appointments.length > 0 ? appointments.map((apt, idx) => {
            const patient = users.find(u => u.healthId === apt.patientId);
            const isNext = idx === 0;
            return (
              <div 
                key={apt.id} 
                onClick={() => onSelectPatient(apt.patientId)}
                className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex justify-between items-center group/item
                  ${isNext ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-100' : 'bg-slate-50 border-transparent hover:bg-white hover:border-emerald-200'}
                `}
              >
                <div className="flex items-center gap-5">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg
                     ${isNext ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border'}
                   `}>
                     {apt.serialNumber || idx + 1}
                   </div>
                   <div>
                     <p className="font-black text-slate-800 group-hover/item:text-emerald-700 transition-colors">{patient?.name || 'Unknown Patient'}</p>
                     <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">{apt.patientId}</p>
                   </div>
                </div>
                {isNext && (
                   <span className="text-[10px] font-black text-emerald-600 bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm animate-pulse uppercase">Next Up</span>
                )}
              </div>
            );
          }) : (
            <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <p className="text-slate-300 font-black italic text-sm">{t('no_appointments')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};