import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { UserRole, UserProfile, Organization, DoctorSchedule } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS: Record<number, string> = {
  0: 'bg-rose-50 text-rose-600 border-rose-100',
  1: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  2: 'bg-blue-50 text-blue-600 border-blue-100',
  3: 'bg-amber-50 text-amber-600 border-amber-100',
  4: 'bg-purple-50 text-purple-600 border-purple-100',
  5: 'bg-pink-50 text-pink-600 border-pink-100',
  6: 'bg-teal-50 text-teal-600 border-teal-100',
};

export default function OrgOwnerDashboard() {
  const { 
    currentUser, 
    organizations, 
    recruitStaff, 
    t, 
    users, 
    schedules, 
    addSchedule,
    updateSchedule,
    removeSchedule, 
    auditLogs, 
    resetLedger 
  } = useApp();
  
  const [tab, setTab] = useState<'staff' | 'audit' | 'recruit' | 'schedules' | 'finance'>('schedules');
  const [recruitmentRole, setRecruitmentRole] = useState<UserRole>(UserRole.MANAGER);
  const [pendingRecruit, setPendingRecruit] = useState<UserProfile | null>(null);

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [newSchDoc, setNewSchDoc] = useState('');
  const [newSchDay, setNewSchDay] = useState(1);
  const [newSchStart, setNewSchStart] = useState('09:00');
  const [newSchEnd, setNewSchEnd] = useState('13:00');
  const [newSchLimit, setNewSchLimit] = useState(20);

  const myOrg = organizations.find(o => o.ownerId === currentUser?.id);
  
  const myOrgAuditLogs = useMemo(() => {
    if (!myOrg) return [];
    return auditLogs.filter(log => log.orgId === myOrg.id);
  }, [auditLogs, myOrg]);

  const liveLedgerStats = useMemo(() => {
    if (!myOrg) return { credits: 0, debits: 0, balance: 0 };
    const credits = myOrg.ledger.filter(e => e.type === 'credit').reduce((a, b) => a + b.amount, 0);
    const debits = myOrg.ledger.filter(e => e.type === 'debit').reduce((a, b) => a + b.amount, 0);
    return { credits, debits, balance: credits - debits };
  }, [myOrg?.ledger]);

  const doctorsInOrg = useMemo(() => {
    if (!myOrg) return [];
    return myOrg.staff
      .filter(s => s.role === UserRole.DOCTOR)
      .map(s => users.find(u => u.id === s.userId))
      .filter(Boolean) as UserProfile[];
  }, [myOrg, users]);

  const orgSchedules = useMemo(() => {
    if (!myOrg) return [];
    return schedules.filter(s => s.orgId === myOrg.id);
  }, [schedules, myOrg]);

  const groupedSchedules = useMemo(() => {
    const groups: Record<string, DoctorSchedule[]> = {};
    orgSchedules.forEach(s => {
      if (!groups[s.doctorId]) groups[s.doctorId] = [];
      groups[s.doctorId].push(s);
    });
    Object.keys(groups).forEach(docId => {
      groups[docId].sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startTime.localeCompare(b.startTime);
      });
    });
    return groups;
  }, [orgSchedules]);

  if (!myOrg) return <div className="p-10 text-center font-bold text-slate-400">Organization not found.</div>;

  const handleRecruitConfirm = () => {
    if (pendingRecruit) {
      recruitStaff(myOrg.id, pendingRecruit.id, recruitmentRole);
      setPendingRecruit(null);
    }
  };

  const handleAddOrUpdateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchDoc) return;
    
    const scheduleData = {
      orgId: myOrg.id,
      doctorId: newSchDoc,
      dayOfWeek: newSchDay,
      startTime: newSchStart,
      endTime: newSchEnd,
      maxPatients: newSchLimit
    };

    if (editingScheduleId) {
      updateSchedule({ id: editingScheduleId, ...scheduleData });
      setEditingScheduleId(null);
    } else {
      addSchedule(scheduleData);
    }
    
    resetScheduleForm();
  };

  const resetScheduleForm = () => {
    setNewSchDoc('');
    setNewSchDay(1);
    setNewSchStart('09:00');
    setNewSchEnd('13:00');
    setNewSchLimit(20);
    setEditingScheduleId(null);
  };

  const startEditSchedule = (s: DoctorSchedule) => {
    setEditingScheduleId(s.id);
    setNewSchDoc(s.doctorId);
    setNewSchDay(s.dayOfWeek);
    setNewSchStart(s.startTime);
    setNewSchEnd(s.endTime);
    setNewSchLimit(s.maxPatients);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetLedger = () => {
    if (confirm("Reset active ledger and archive current session?")) {
      resetLedger(myOrg.id);
    }
  };

  const isExpired = new Date(myOrg.expiresAt) < new Date();
  const isRevoked = myOrg.status === 'revoked';
  const isSuspended = myOrg.status === 'suspended';

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      {pendingRecruit && (
        <ConfirmationModal user={pendingRecruit} title="Confirm Staff Selection" onConfirm={handleRecruitConfirm} onCancel={() => setPendingRecruit(null)} />
      )}

      <div className={`p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center border border-white/5 transition-colors
        ${isRevoked || isExpired ? 'bg-red-950 text-white' : isSuspended ? 'bg-amber-900 text-white' : 'bg-slate-900 text-white'}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border">🏢</div>
             <h2 className="text-4xl font-black tracking-tight">{myOrg.name}</h2>
          </div>
          <p className="opacity-60 text-sm font-bold">{myOrg.location}</p>
          <div className="flex flex-wrap gap-3">
             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
               ${isRevoked ? 'bg-red-500/20 border-red-500/40 text-red-200' : 
                 isSuspended ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' :
                 isExpired ? 'bg-red-500/20 border-red-500/40 text-red-200' :
                 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'}`}>
                Status: {isRevoked ? 'REVOKED' : isSuspended ? 'ON HOLD' : isExpired ? 'EXPIRED' : 'ACTIVE'}
             </span>
          </div>
        </div>

        <div className="flex gap-8 items-center relative z-10 mt-6 md:mt-0">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Live Balance</p>
            <p className="text-3xl font-black text-emerald-400">৳{liveLedgerStats.balance}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[2rem] border shadow-sm w-fit mx-auto sticky top-4 z-50 overflow-x-auto no-scrollbar max-w-full">
        {[
          { id: 'schedules', label: t('chamber_roster'), icon: '📅' },
          { id: 'staff', label: t('staff_dashboard'), icon: '👥' },
          { id: 'recruit', label: t('recruit'), icon: '➕' },
          { id: 'finance', label: 'Finance', icon: '💰' },
          { id: 'audit', label: 'Activity', icon: '📜' }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setTab(item.id as any)} 
            className={`px-6 py-3 rounded-full text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${tab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {tab === 'staff' && (
        <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-10 py-6 ui-label">Professional Info</th>
                <th className="px-10 py-6 ui-label">Clinical Role</th>
                <th className="px-10 py-6 ui-label text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrg.staff.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6"> 
                    <p className="text-sm font-bold text-slate-800">{users.find(u => u.id === s.userId)?.name || s.userId}</p> 
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{s.userId}</p>
                  </td>
                  <td className="px-10 py-6"> <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">{s.role}</span> </td>
                  <td className="px-10 py-6 text-right"> <button className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase transition-colors">Terminate</button> </td>
                </tr>
              ))}
              {myOrg.staff.length === 0 && (
                <tr>
                   <td colSpan={3} className="py-20 text-center text-slate-300 font-bold italic">No staff members currently hired.</td>
                </tr>
              )}
            </tbody>
          </table>
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
                   <option value={UserRole.DOCTOR}>Doctor</option>
                </select>
             </div>
             
             <div className="space-y-4">
                <p className="ui-label">স্টাফ খুঁজুন (আইডি বা মোবাইল দিয়ে)</p>
                <RecruitSearch onResult={(u) => setPendingRecruit(u)} />
             </div>
           </div>
        </div>
      )}

      {tab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in">
           <div className="lg:col-span-4">
              <form onSubmit={handleAddOrUpdateSchedule} className="bg-white p-10 rounded-[3rem] border shadow-2xl space-y-6 sticky top-24 border-emerald-50">
                 <div className="flex justify-between items-center pb-2 border-b">
                    <h3 className="text-xl font-black text-slate-800">{editingScheduleId ? '✏️ Edit Schedule' : '➕ Add Schedule'}</h3>
                    {editingScheduleId && (
                      <button type="button" onClick={resetScheduleForm} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Cancel</button>
                    )}
                 </div>
                 
                 <div className="space-y-2">
                    <label className="ui-label">Select Professional</label>
                    <select className="ui-input h-14 font-bold" value={newSchDoc} onChange={e => setNewSchDoc(e.target.value)} required disabled={!!editingScheduleId}>
                       <option value="">Choose Doctor...</option>
                       {doctorsInOrg.map(doc => (
                         <option key={doc.id} value={doc.id}>{doc.name}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="ui-label">Visiting Day</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS.map((day, idx) => (
                        <button 
                          key={day} 
                          type="button"
                          onClick={() => setNewSchDay(idx)}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2
                            ${newSchDay === idx ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}
                          `}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="ui-label">Session Start</label>
                       <input type="time" className="ui-input h-14 font-bold" value={newSchStart} onChange={e => setNewSchStart(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                       <label className="ui-label">Session End</label>
                       <input type="time" className="ui-input h-14 font-bold" value={newSchEnd} onChange={e => setNewSchEnd(e.target.value)} required />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="ui-label">Patient Limit (Slots)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border">
                      <button type="button" onClick={() => setNewSchLimit(Math.max(1, newSchLimit - 5))} className="w-10 h-10 rounded-xl bg-white border font-bold hover:bg-slate-100">-</button>
                      <input type="number" className="flex-1 bg-transparent text-center font-black text-xl outline-none" value={newSchLimit} readOnly />
                      <button type="button" onClick={() => setNewSchLimit(newSchLimit + 5)} className="w-10 h-10 rounded-xl bg-white border font-bold hover:bg-slate-100">+</button>
                    </div>
                 </div>

                 <button type="submit" className={`ui-btn w-full py-5 text-lg rounded-[2rem] shadow-xl transition-all active:scale-95 ${editingScheduleId ? 'bg-slate-900 text-white' : 'ui-btn-primary shadow-emerald-100'}`}>
                   {editingScheduleId ? 'Save Changes' : 'Confirm Schedule'}
                 </button>
              </form>
           </div>
           
           <div className="lg:col-span-8 space-y-12">
              {Object.keys(groupedSchedules).length > 0 ? (
                <div className="space-y-12">
                   {Object.keys(groupedSchedules).map(docId => {
                     const doc = users.find(u => u.id === docId);
                     const docSlots = groupedSchedules[docId];
                     return (
                       <div key={docId} className="bg-white rounded-[4rem] border shadow-sm overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
                          <div className="p-10 bg-slate-50 border-b flex flex-col md:flex-row items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                                <div className="relative">
                                  <img src={doc?.photoUrl} className="w-20 h-20 rounded-[2rem] shadow-xl border-4 border-white" alt="" />
                                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white text-xs">🩺</div>
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{doc?.name}</h4>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{doc?.specialty || 'General Practitioner'}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">{docSlots.length} Active Slots</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button className="ui-btn ui-btn-outline px-6 py-2.5 text-[10px] uppercase font-black tracking-widest rounded-xl hover:bg-white hover:text-emerald-600">Download PDF</button>
                             </div>
                          </div>

                          <div className="p-10">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {docSlots.map(sch => (
                                  <div key={sch.id} className="group relative bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-500 transition-all p-8 flex flex-col justify-between overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 opacity-5 rounded-full ${DAY_COLORS[sch.dayOfWeek].split(' ')[0]}`}></div>
                                     
                                     <div className="space-y-6 relative z-10">
                                        <div className="flex justify-between items-start">
                                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${DAY_COLORS[sch.dayOfWeek]}`}>
                                              {DAYS[sch.dayOfWeek]}
                                           </span>
                                           <div className="flex gap-1">
                                              <button 
                                                onClick={() => startEditSchedule(sch)}
                                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all text-slate-400 shadow-sm border border-slate-100"
                                                title="Edit Session"
                                              >
                                                ✏️
                                              </button>
                                              <button 
                                                onClick={() => { if(confirm('Permanently remove this visiting session?')) removeSchedule(sch.id); }}
                                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all text-slate-400 shadow-sm border border-slate-100"
                                                title="Delete Session"
                                              >
                                                🗑️
                                              </button>
                                           </div>
                                        </div>

                                        <div className="space-y-1">
                                           <p className="text-3xl font-black text-slate-900 tracking-tighter">
                                             {sch.startTime} <span className="text-slate-300 font-medium mx-1">-</span> {sch.endTime}
                                           </p>
                                           <div className="flex items-center gap-2">
                                              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                 <div className="h-full bg-emerald-500 w-[10%]"></div>
                                              </div>
                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Cap: {sch.maxPatients}
                                              </span>
                                           </div>
                                        </div>
                                     </div>

                                     <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 border-t pt-6 border-slate-50">
                                        <span>Verified Station</span>
                                        <span className="text-emerald-500">Live Status: Active</span>
                                     </div>
                                  </div>
                                ))}
                                
                                <button 
                                  onClick={() => { setNewSchDoc(docId); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                                  className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-emerald-300 hover:text-emerald-400 transition-all hover:bg-emerald-50/20"
                                >
                                   <span className="text-4xl">➕</span>
                                   <span className="text-[10px] font-black uppercase tracking-widest">New Session for {doc?.name.split(' ')[1]}</span>
                                </button>
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="py-48 text-center bg-white rounded-[5rem] border-4 border-dashed border-slate-100 animate-pulse">
                  <div className="text-9xl mb-10 grayscale opacity-10">🗓️</div>
                  <h3 className="text-3xl font-black text-slate-300 tracking-tight">Roster Empty</h3>
                  <p className="text-slate-400 font-bold mt-4 leading-relaxed text-lg px-20">
                    Your chamber roster is currently unconfigured. Use the management panel on the left to set up weekly visiting schedules for your clinical staff.
                  </p>
                </div>
              )}
           </div>
        </div>
      )}

      {tab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-slate-900">Session Ledger</h3>
                    <button onClick={handleResetLedger} disabled={myOrg.ledger.length === 0} className="ui-btn ui-btn-primary py-3 px-8 text-xs disabled:opacity-30">Reset Session</button>
                 </div>
                 <div className="space-y-3">
                    {myOrg.ledger.map(entry => (
                       <div key={entry.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                          <div className="flex gap-3 items-center">
                             <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${entry.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {entry.type === 'credit' ? '↓' : '↑'}
                             </span>
                             <p className="text-xs font-bold text-slate-800">{entry.note}</p>
                          </div>
                          <p className={`font-black ${entry.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>৳{entry.amount}</p>
                       </div>
                    ))}
                    {myOrg.ledger.length === 0 && (
                      <div className="py-20 text-center text-slate-300 font-bold italic">No financial records in active session.</div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white p-10 rounded-[3rem] border shadow-sm animate-in fade-in">
           <h3 className="text-xl font-black mb-8">System Audit Trail</h3>
           <div className="space-y-4">
              {myOrgAuditLogs.map(log => (
                <div key={log.id} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-black text-slate-800 text-sm">{log.details}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Actor: {log.actorName}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</p>
                   </div>
                </div>
              ))}
              {myOrgAuditLogs.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold italic">No clinical activity recorded yet.</div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}

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
          className="ui-input h-14 pl-12 font-medium bg-white" 
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