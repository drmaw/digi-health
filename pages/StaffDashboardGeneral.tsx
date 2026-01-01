import React, { useState, useMemo } from 'react';
import { Organization, UserRole, UserProfile, DoctorSchedule } from '../types';
import { useApp } from '../../context/AppContext';
import { QRScannerModal } from '../components/QRScannerModal';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getNextVisitDate = (dayOfWeek: number) => {
  const now = new Date();
  const resultDate = new Date();
  const diff = (dayOfWeek + 7 - now.getDay()) % 7;
  resultDate.setDate(now.getDate() + diff);
  return resultDate.toISOString().split('T')[0];
};

export default function StaffDashboardGeneral({ org, role }: { org: Organization, role: UserRole }) {
  const { users, schedules, appointments, bookAppointment, addFinancialEntry, t } = useApp();
  const [activeTab, setActiveTab] = useState<'ops' | 'appointments' | 'finance'>('ops');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<UserProfile | null>(null);

  const [finType, setFinType] = useState<'credit' | 'debit'>('credit');
  const [finAmount, setFinAmount] = useState('');
  const [finNote, setFinNote] = useState('');

  const filteredPatients = searchQuery.length > 2 
    ? users.filter(u => u.healthId.includes(searchQuery) || u.phone.includes(searchQuery))
    : [];

  const orgSchedules = schedules.filter(s => s.orgId === org.id);
  const orgApts = appointments.filter(a => a.orgId === org.id);

  const handleBooking = (docId: string, date: string) => {
    if (selectedPatient) {
      bookAppointment({
        orgId: org.id,
        doctorId: docId,
        patientId: selectedPatient.healthId,
        date: date
      });
      setSelectedPatient(null);
      setSearchQuery('');
      alert("Appointment confirmed!");
    }
  };

  const handleAddFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finAmount || isNaN(Number(finAmount))) return;
    addFinancialEntry(org.id, {
      type: finType,
      amount: Number(finAmount),
      note: finNote
    });
    setFinAmount('');
    setFinNote('');
  };

  const liveLedgerStats = useMemo(() => {
    const credits = org.ledger.filter(e => e.type === 'credit').reduce((a, b) => a + b.amount, 0);
    const debits = org.ledger.filter(e => e.type === 'debit').reduce((a, b) => a + b.amount, 0);
    return { credits, debits, balance: credits - debits };
  }, [org.ledger]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black">{org.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{role} Console</p>
          </div>
        </div>
        
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 z-10 mt-6 md:mt-0 overflow-x-auto no-scrollbar max-w-full">
          <button onClick={() => setActiveTab('ops')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'ops' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'}`}>Ops Hub</button>
          <button onClick={() => setActiveTab('appointments')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'appointments' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'}`}>Appointments</button>
          {role === UserRole.MANAGER && (
            <button onClick={() => setActiveTab('finance')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'finance' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'}`}>Finance Desk</button>
          )}
        </div>
      </div>

      {activeTab === 'ops' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-8">Quick Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Admissions Desk', icon: '👤', desc: 'Process admissions', action: () => {} },
                  { label: 'Billing Desk', icon: '💳', desc: 'Process payments', action: () => role === UserRole.MANAGER && setActiveTab('finance') },
                  { label: 'Inventory Hub', icon: '📦', desc: 'Medical supplies', action: () => {} },
                  { label: 'Patient Queue', icon: '📅', desc: 'Appointment desk', action: () => setActiveTab('appointments') }
                ].map(action => (
                  <button 
                    key={action.label} 
                    onClick={action.action}
                    className="p-8 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-emerald-500 hover:bg-white transition-all text-left group"
                  >
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <p className="font-black text-slate-800">{action.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                  <span className="text-lg">📊</span> Daily Snapshot
                </h3>
                <div className="space-y-4">
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                      <span className="text-xs font-black text-blue-700 uppercase">Wait Time</span>
                      <span className="text-xl font-black text-blue-900">12m</span>
                  </div>
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
                      <span className="text-xs font-black text-emerald-700 uppercase">Available Beds</span>
                      <span className="text-xl font-black text-emerald-900">{org.beds.filter(b => !b.isOccupied).length} / {org.beds.length}</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finance' && role === UserRole.MANAGER && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-10 duration-500">
           <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-8">Cash Counter Ledger</h3>
                
                <form onSubmit={handleAddFinancial} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                   <div className="space-y-2">
                      <label className="ui-label">Transaction Type</label>
                      <select 
                        value={finType} 
                        onChange={e => setFinType(e.target.value as any)} 
                        className="ui-input bg-white h-12 font-bold"
                      >
                         <option value="credit">Income (Credit)</option>
                         <option value="debit">Expense (Debit)</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="ui-label">Amount (BDT)</label>
                      <input 
                        className="ui-input h-12 bg-white font-mono font-black" 
                        placeholder="0.00"
                        value={finAmount}
                        onChange={e => setFinAmount(e.target.value)}
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="ui-label">Note / Reference</label>
                      <input 
                        className="ui-input h-12 bg-white font-bold" 
                        placeholder="Reason for cash entry..."
                        value={finNote}
                        onChange={e => setFinNote(e.target.value)}
                        required
                      />
                   </div>
                   <button type="submit" className="sm:col-span-3 ui-btn ui-btn-primary py-4 rounded-2xl shadow-xl shadow-emerald-200 text-lg">Record Transaction</button>
                </form>

                <div className="space-y-4">
                   <h4 className="ui-label text-slate-400">Today's Transactions</h4>
                   <div className="max-h-[500px] overflow-y-auto no-scrollbar space-y-3">
                     {org.ledger.length > 0 ? [...org.ledger].reverse().map(entry => (
                       <div key={entry.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${entry.type === 'credit' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {entry.type === 'credit' ? '↓' : '↑'}
                             </div>
                             <div>
                                <p className="font-black text-slate-800">{entry.note}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                             </div>
                          </div>
                          <p className={`text-lg font-black ${entry.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {entry.type === 'credit' ? '+' : '-'} ৳{entry.amount}
                          </p>
                       </div>
                     )) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-[3rem] text-slate-300">
                           <p className="font-bold italic">No transactions recorded in this session.</p>
                        </div>
                     )}
                   </div>
                </div>
             </div>
           </div>

           <div className="space-y-6">
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <h3 className="text-xl font-black mb-6">Current Session Total</h3>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center opacity-60">
                       <span className="text-xs font-black uppercase tracking-widest">Total Credit</span>
                       <span className="font-bold">৳{liveLedgerStats.credits}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60">
                       <span className="text-xs font-black uppercase tracking-widest">Total Debit</span>
                       <span className="font-bold">৳{liveLedgerStats.debits}</span>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                       <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Cash In Hand</span>
                       <span className="text-3xl font-black text-emerald-400">৳{liveLedgerStats.balance}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
             <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-2xl font-black text-slate-900">Patient Booking Desk</h3>
                   {selectedPatient && (
                     <div className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                        <img src={selectedPatient.photoUrl} className="w-8 h-8 rounded-lg" alt="" />
                        <p className="text-xs font-black text-emerald-700">{selectedPatient.name}</p>
                        <button onClick={() => setSelectedPatient(null)} className="text-emerald-400 font-black">✖</button>
                     </div>
                   )}
                </div>

                {!selectedPatient ? (
                  <div className="space-y-6">
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                          <input 
                            className="ui-input h-14 pl-12 font-bold bg-white" 
                            placeholder="Search Patient (ID or Mobile)..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2">🔍</span>
                       </div>
                       <button onClick={() => setIsScanning(true)} className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl border">📷</button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {filteredPatients.map(p => (
                         <div 
                           key={p.id} 
                           onClick={() => setSelectedPatient(p)}
                           className="flex items-center gap-4 p-4 bg-white border-2 border-slate-50 hover:border-emerald-500 rounded-2xl cursor-pointer transition-all shadow-sm"
                         >
                           <img src={p.photoUrl} className="w-12 h-12 rounded-xl" alt="" />
                           <div>
                             <p className="font-black text-slate-800 text-sm">{p.name}</p>
                             <p className="text-[10px] font-mono font-bold text-emerald-600">{p.healthId}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-12">
                     <div className="flex items-center gap-4">
                        <h4 className="ui-label text-slate-400">Available Doctors & Next Visit Slots</h4>
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {orgSchedules.map(sch => {
                         const doc = users.find(u => u.id === sch.doctorId);
                         const nextVisitDate = getNextVisitDate(sch.dayOfWeek);
                         const aptsOnDate = orgApts.filter(a => a.doctorId === sch.doctorId && a.date.split('T')[0] === nextVisitDate && a.status === 'scheduled');
                         const isFull = aptsOnDate.length >= sch.maxPatients;
                         
                         return (
                           <div key={sch.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                              <div className="flex items-center gap-4">
                                 <img src={doc?.photoUrl} className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm" alt="" />
                                 <div>
                                    <p className="font-black text-slate-900">{doc?.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{DAYS[sch.dayOfWeek]} • {sch.startTime}</p>
                                 </div>
                              </div>
                              <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Visit Date</p>
                                 <p className="font-black text-slate-800">{new Date(nextVisitDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                 <div className="text-[10px] font-black text-slate-400 uppercase">
                                   Queue: <span className={isFull ? 'text-red-500' : 'text-emerald-600'}>{aptsOnDate.length} / {sch.maxPatients}</span>
                                 </div>
                                 <button 
                                  disabled={isFull}
                                  onClick={() => handleBooking(sch.doctorId, nextVisitDate)}
                                  className="ui-btn ui-btn-primary py-2 px-6 text-[10px]"
                                 >
                                   Book Slot
                                 </button>
                              </div>
                           </div>
                         );
                       })}
                     </div>
                  </div>
                )}
             </div>
           </div>

           <div className="space-y-6">
              <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
                 <h3 className="font-black text-slate-800 mb-6">Live Queue Snapshot</h3>
                 <div className="space-y-4">
                    {orgApts.filter(a => a.status === 'scheduled').slice(0, 10).map(apt => {
                      const patient = users.find(u => u.healthId === apt.patientId);
                      const doc = users.find(u => u.id === apt.doctorId);
                      return (
                        <div key={apt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                           <img src={patient?.photoUrl} className="w-10 h-10 rounded-xl" alt="" />
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate">{patient?.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase truncate">Dr. {doc?.name}</p>
                           </div>
                           <span className="text-[10px] font-black text-emerald-600">#{apt.serialNumber}</span>
                        </div>
                      );
                    })}
                 </div>
              </div>
           </div>
        </div>
      )}

      {isScanning && <QRScannerModal onScan={(id) => { setSearchQuery(id); setIsScanning(false); }} onClose={() => setIsScanning(false)} />}
    </div>
  );
}