import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Investigation, Organization } from '../types';

export default function StaffDashboardPathology({ org }: { org: Organization }) {
  const { users, investigations, completeInvestigation, t } = useApp();
  const [selectedInv, setSelectedInv] = useState<Investigation | null>(null);
  const [findings, setFindings] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingInvestigations = investigations.filter(inv => inv.orgId === org.id && inv.status === 'Requested');

  const getPatientName = (id?: string) => {
    if (!id) return 'Unknown';
    const patient = users.find(u => u.id === id || u.healthId === id);
    return patient ? patient.name : 'Unknown';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadedFileName(file.name);
      setTimeout(() => setIsUploading(false), 1500);
    }
  };

  const handleCompleteTest = () => {
    if (selectedInv) {
      const mockFileUrl = uploadedFileName ? `reports/${uploadedFileName}` : undefined;
      completeInvestigation(selectedInv.id, findings, mockFileUrl);
      setSelectedInv(null);
      setFindings('');
      setUploadedFileName(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-emerald-950 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <h2 className="text-3xl font-black relative z-10">{org.name}</h2>
          <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 relative z-10">Diagnostic & Lab Console</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border shadow-sm">
           <div className="mb-10">
             <h3 className="text-xl font-black text-slate-800">ল্যাব ইনভেস্টিগেশন</h3>
             <p className="text-slate-400 text-xs font-bold mt-1">Pending test results to be uploaded</p>
           </div>
           
           <div className="space-y-3">
             {pendingInvestigations.map(inv => (
               <div key={inv.id} className="flex justify-between items-center p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-emerald-50 hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-hover:bg-emerald-100 transition-colors">🧪</div>
                    <div>
                       <p className="font-black text-slate-800 text-lg">{inv.testName}</p>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Patient: {getPatientName(inv.patientId)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedInv(inv)}
                    className="ui-btn ui-btn-primary bg-slate-900 py-3 px-6 text-[10px]"
                  >
                    Result Entry
                  </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        {selectedInv ? (
          <div className="bg-white p-10 rounded-[3.5rem] border-4 border-emerald-900/5 shadow-2xl animate-in zoom-in duration-300">
             <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3">
               <span className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl">📝</span> 
               Entry
             </h3>
             
             <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <p className="ui-label text-emerald-600">Active Task</p>
                  <p className="font-black text-emerald-950 text-lg leading-tight">{selectedInv.testName}</p>
                  <p className="text-[10px] font-bold text-emerald-700 mt-1">{getPatientName(selectedInv.patientId)}</p>
                </div>

                <div className="space-y-2">
                  <label className="ui-label">Test Findings</label>
                  <textarea 
                    className="ui-input h-40 py-5 resize-none text-sm font-medium leading-relaxed"
                    placeholder="Describe relevant findings and observations..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <label className="ui-label">Report Attachment</label>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,image/*" />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex flex-col items-center justify-center gap-3 p-8 rounded-[2rem] border-2 border-dashed transition-all
                      ${uploadedFileName ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-emerald-400'}
                    `}
                  >
                    {isUploading ? (
                      <span className="text-xs font-black animate-pulse">Processing File...</span>
                    ) : uploadedFileName ? (
                      <>
                        <span className="text-4xl">📄</span>
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase">Report Uploaded</p>
                          <p className="text-xs font-bold truncate max-w-[200px] mt-1">{uploadedFileName}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl opacity-50">📤</span>
                        <span className="text-xs font-black uppercase tracking-widest">Upload Official PDF</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <button 
                    onClick={handleCompleteTest}
                    disabled={!findings && !uploadedFileName}
                    className="ui-btn ui-btn-primary w-full py-5 shadow-2xl shadow-emerald-200 disabled:opacity-50"
                  >
                    Verify & Release
                  </button>
                  <button 
                    onClick={() => setSelectedInv(null)}
                    className="ui-btn ui-btn-outline w-full py-4"
                  >
                    Cancel
                  </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">🧬</div>
            <p className="font-black text-slate-800">Select an Investigation</p>
          </div>
        )}
      </div>
    </div>
  );
}