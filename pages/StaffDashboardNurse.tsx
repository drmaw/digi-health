import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bed, Organization } from '../types';
import { QRScannerModal } from '../components/QRScannerModal';

export default function StaffDashboardNurse({ org }: { org: Organization }) {
  const { users, updateBedStatus, t } = useApp();
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const getPatientName = (id?: string) => {
    if (!id) return 'Unknown';
    const patient = users.find(u => u.id === id || u.healthId === id);
    return patient ? patient.name : 'Unknown';
  };

  const getPatientPhoto = (id?: string) => {
    if (!id) return null;
    const patient = users.find(u => u.id === id || u.healthId === id);
    return patient?.photoUrl;
  };

  const filteredPatients = users.filter(u => 
    (u.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
    u.healthId.includes(patientSearch)) &&
    patientSearch.length > 2
  );

  const handleBedUpdate = (isOccupied: boolean, patientId?: string) => {
    if (selectedBed) {
      updateBedStatus(org.id, selectedBed.id, isOccupied, patientId);
      setSelectedBed(null);
      setPatientSearch('');
    }
  };

  const handleQRScan = (healthId: string) => {
    setIsScanning(false);
    setPatientSearch(healthId);
  };

  const wards = org.beds.filter(b => b.type === 'Ward');
  const cabins = org.beds.filter(b => b.type === 'Cabin');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      {isScanning && (
        <QRScannerModal onScan={handleQRScan} onClose={() => setIsScanning(false)} />
      )}
      
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-emerald-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex justify-between items-center border border-emerald-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight">{org.name}</h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
               <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.2em]">Nursing Station: Live Facility Map</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border shadow-sm space-y-16">
          <div className="flex justify-between items-center">
            <div>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight">Floor Plan View</h3>
            </div>
          </div>

          <div className="space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <h4 className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">Zone A: General Wards</h4>
                 <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {wards.map(b => (
                  <BedIconCard 
                    key={b.id} 
                    bed={b} 
                    isSelected={selectedBed?.id === b.id} 
                    onClick={() => setSelectedBed(b)}
                    photo={getPatientPhoto(b.currentPatientId)}
                    patientName={getPatientName(b.currentPatientId)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <h4 className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase tracking-widest">Zone B: Private Cabins</h4>
                 <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {cabins.map(b => (
                  <button 
                    key={b.id} 
                    onClick={() => setSelectedBed(b)}
                    className={`group relative p-8 rounded-[2.5rem] border-2 text-center transition-all flex flex-col items-center justify-center gap-2
                      ${b.isOccupied 
                        ? 'border-rose-100 bg-rose-50/40 text-rose-600 shadow-sm' 
                        : 'border-emerald-100 bg-emerald-50/20 text-emerald-600 hover:border-emerald-500 hover:bg-white hover:shadow-xl hover:shadow-emerald-100'}
                      ${selectedBed?.id === b.id ? 'ring-4 ring-slate-900/10 border-slate-900 scale-105 z-10' : ''}
                    `}
                  >
                    <div className="text-4xl">{b.isOccupied ? '🏨' : '🚪'}</div>
                    <div className="text-xs font-black uppercase tracking-tight">{b.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {selectedBed ? (
          <div className="bg-white p-10 rounded-[4rem] border-4 border-slate-900/5 shadow-2xl animate-in slide-in-from-right-10 duration-500 sticky top-10">
             <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-slate-800 text-xl flex items-center gap-3">
                  <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl">🛏️</span> 
                  {selectedBed.label}
                </h3>
                <button onClick={() => setSelectedBed(null)} className="w-10 h-10 rounded-full border hover:bg-slate-50 transition-colors">✖</button>
             </div>
             
             {selectedBed.isOccupied ? (
               <div className="space-y-8">
                  <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 text-center space-y-4">
                     <div className="mx-auto w-24 h-24 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-rose-200">
                        <img 
                          src={getPatientPhoto(selectedBed.currentPatientId) || `https://api.dicebear.com/7.x/initials/svg?seed=${getPatientName(selectedBed.currentPatientId)}`} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                     </div>
                     <div>
                        <p className="font-black text-rose-700 text-2xl leading-tight mt-1">{getPatientName(selectedBed.currentPatientId)}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={() => handleBedUpdate(false)}
                      className="ui-btn ui-btn-primary bg-rose-600 hover:bg-rose-700 w-full py-5 rounded-2xl shadow-xl shadow-rose-200 font-black text-lg"
                    >
                      Process Discharge
                    </button>
                  </div>
               </div>
             ) : (
               <div className="space-y-8">
                  <div className="space-y-4">
                     <label className="ui-label">Patient Search</label>
                     <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <input 
                            type="text" 
                            placeholder="Health ID বা মোবাইল..."
                            className="ui-input h-14 pl-12 text-sm font-bold bg-white focus:bg-white transition-all rounded-2xl border-slate-100"
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={() => setIsScanning(true)}
                          className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center text-2xl"
                        >
                          📷
                        </button>
                     </div>
                  </div>
                  
                  {filteredPatients.length > 0 && (
                    <div className="bg-white rounded-[2rem] border-2 border-slate-50 p-2 space-y-1 max-h-72 overflow-y-auto custom-scrollbar shadow-inner">
                       {filteredPatients.map(p => (
                         <button 
                           key={p.id}
                           onClick={() => handleBedUpdate(true, p.healthId)}
                           className="w-full text-left p-5 hover:bg-emerald-50 rounded-[1.5rem] flex items-center gap-4 transition-all"
                         >
                           <img src={p.photoUrl} className="w-10 h-10 rounded-xl" alt="" />
                           <div>
                             <p className="text-sm font-black text-slate-800 leading-tight">{p.name}</p>
                           </div>
                         </button>
                       ))}
                    </div>
                  )}
               </div>
             )}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">🏨</div>
            <p className="font-black text-slate-800">Select Room</p>
          </div>
        )}
      </div>
    </div>
  );
}

const BedIconCard: React.FC<{ bed: Bed, isSelected: boolean, onClick: () => void, photo?: string | null, patientName?: string }> = ({ bed, isSelected, onClick, photo, patientName }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative rounded-3xl border-2 transition-all flex flex-col items-center justify-center p-4 min-h-[120px] group
        ${bed.isOccupied 
          ? 'bg-rose-50/30 border-rose-100 text-rose-500 shadow-sm' 
          : 'bg-emerald-50/20 border-emerald-100 text-emerald-500 hover:border-emerald-500 hover:bg-white hover:shadow-xl hover:shadow-emerald-100'}
        ${isSelected ? 'ring-4 ring-slate-900/10 border-slate-900 scale-105 z-10' : ''}
      `}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {bed.isOccupied && photo ? (
           <img src={photo} className="w-10 h-10 rounded-xl mb-2 border-2 border-white shadow-md" alt="" />
        ) : (
          <span className="text-3xl mb-2 opacity-80">{bed.isOccupied ? '🛌' : '🛏️'}</span>
        )}
        
        <div className="text-center w-full">
          <p className="text-[9px] font-black uppercase tracking-tighter opacity-60 truncate">{bed.label}</p>
        </div>
      </div>
    </button>
  );
};