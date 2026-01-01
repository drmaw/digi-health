import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, ChronicConditions, EmergencyContact, UserRole } from '../types';

export default function ProfileSettingsPage() {
  const { currentUser, updateUser, users, t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    ...currentUser!,
    emergencyContacts: currentUser?.emergencyContacts || [],
    chronicConditions: currentUser?.chronicConditions || {
      hypertension: false,
      diabetes: false,
      asthma: false
    }
  });
  const [isSaved, setIsSaved] = useState(false);
  
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactMode, setContactMode] = useState<'manual' | 'search'>('manual');
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    relation: ''
  });
  const [contactSearch, setContactSearch] = useState('');

  if (!currentUser) return null;

  const isDoctor = currentUser.activeRoles.includes(UserRole.DOCTOR);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
    setIsSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoUrl: reader.result as string
        }));
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCondition = (key: keyof ChronicConditions) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: {
        ...prev.chronicConditions,
        [key]: !prev.chronicConditions[key]
      }
    }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('manage_profile')}</h2>
          <p className="text-slate-400 font-black uppercase text-xs tracking-[0.3em] mt-2">Certified Citizen Demographics</p>
        </div>
        {isSaved && (
          <div className="bg-emerald-600 text-white px-8 py-4 rounded-[2rem] font-black text-sm animate-in slide-in-from-right-10 shadow-2xl shadow-emerald-200">
            ✅ তথ্য সফলভাবে সংরক্ষিত হয়েছে
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="space-y-10">
          <div className="bg-white p-12 rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden sticky top-32 border border-slate-50">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
            <p className="ui-label mb-10 text-emerald-600 tracking-[0.4em]">Live Card</p>
            
            <div className="text-center space-y-10">
              <div className="relative group mx-auto w-44 h-44">
                <div className="w-full h-full rounded-[3.5rem] border-8 border-white shadow-2xl overflow-hidden bg-slate-50 transform group-hover:rotate-6 transition-transform duration-500">
                  <img 
                    src={formData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[3.5rem] text-white text-sm font-black tracking-widest uppercase"
                >
                  Upload
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 leading-tight">{formData.name || 'Set Name'}</h3>
                <div className="bg-emerald-50 py-3 px-6 rounded-2xl inline-block border border-emerald-100/50">
                   <p className="text-emerald-600 font-mono font-black text-xl tracking-tighter">{formData.healthId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-16">
          <form onSubmit={handleSave} className="space-y-16">
            {isDoctor && (
              <div className="bg-white p-14 rounded-[4rem] border shadow-sm space-y-12 animate-in slide-in-from-top-4">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm">🎓</div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Professional Credentials</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-2">
                    <label className="ui-label">BMDC Registration No.</label>
                    <input type="text" name="bmdcNumber" value={formData.bmdcNumber || ''} onChange={handleChange} className="ui-input font-mono font-bold" placeholder="e.g. BMDC-A-12345" />
                  </div>
                  <div className="space-y-2">
                    <label className="ui-label">Clinical Specialty</label>
                    <input type="text" name="specialty" value={formData.specialty || ''} onChange={handleChange} className="ui-input" placeholder="e.g. Cardiology, Pediatrics..." />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-14 rounded-[4rem] border shadow-sm space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm">👤</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                  <label className="ui-label">{t('full_name')}</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="ui-input" required />
                </div>
                <div className="space-y-2">
                  <label className="ui-label">{t('phone')}</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="ui-input" required />
                </div>
              </div>
            </div>

            <div className="bg-white p-14 rounded-[4rem] border shadow-sm space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm">🧬</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Health Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                <div className="space-y-2">
                  <label className="ui-label">বয়স (Age)</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="ui-input" />
                </div>
                <div className="space-y-2">
                  <label className="ui-label">{t('gender')}</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="ui-input h-[60px] font-black uppercase text-xs">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="ui-label">{t('blood_group')}</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="ui-input h-[60px] font-black uppercase text-xs">
                    <option value="N/A">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="md:col-span-3 space-y-6 pt-6">
                  <label className="ui-label">Chronic Conditions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { id: 'hypertension', label: t('hypertension'), color: 'red' },
                      { id: 'diabetes', label: t('diabetes'), color: 'blue' },
                      { id: 'asthma', label: t('asthma'), color: 'amber' }
                    ].map(cond => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => toggleCondition(cond.id as any)}
                        className={`py-6 px-4 rounded-3xl font-black text-xs transition-all border-2 flex flex-col items-center gap-4
                          ${formData.chronicConditions[cond.id as keyof ChronicConditions]
                            ? `bg-emerald-900 border-emerald-900 text-white shadow-xl scale-105`
                            : `bg-white border-slate-100 text-slate-400 hover:border-emerald-200`
                          }`}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-10">
               <button type="submit" className="ui-btn ui-btn-primary py-8 px-24 text-2xl shadow-[0_30px_60px_-15px_rgba(16,185,129,0.3)] rounded-[3rem] active:scale-95 transition-all">
                 {t('save_changes')}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}