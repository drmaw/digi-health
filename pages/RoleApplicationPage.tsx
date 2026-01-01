import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';

const RoleApplicationPage: React.FC = () => {
  const { applyForRole, t } = useApp();
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);
  const [details, setDetails] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await applyForRole(role, details, regNumber);
      if (result) {
        setError(result);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (submitted) return (
    <div className="p-10 text-center space-y-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Submitted</h2>
      <p className="text-slate-500">Administrators will verify your credentials soon.</p>
      <button onClick={() => setSubmitted(false)} className="ui-btn ui-btn-primary mt-4">Apply for another</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="ui-card space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('apply')}</h2>
          <p className="text-slate-500 text-sm mt-1">Provide your professional credentials for verification</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold flex gap-2 items-center">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="ui-label">Role to apply for</label>
            <select 
              className="ui-input bg-white h-14 font-bold" 
              value={role} 
              onChange={e => setRole(e.target.value as UserRole)}
            >
              <option value={UserRole.DOCTOR}>Doctor (BMDC Required)</option>
              <option value={UserRole.NURSE}>Nurse (Registration Required)</option>
              <option value={UserRole.PATHOLOGIST}>Pathologist</option>
              <option value={UserRole.ORG_OWNER}>Organization Owner (Trade License/DGHS)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="ui-label">Registration Number</label>
            <input 
              type="text"
              className="ui-input h-14 font-mono font-bold"
              placeholder="e.g. BMDC-A-12345"
              required
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="ui-label">Professional Details</label>
            <textarea 
              className="ui-input h-32 py-4" 
              required
              placeholder="List your qualifications or organization details..."
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </div>

          <button type="submit" className="ui-btn ui-btn-primary w-full py-5 text-lg shadow-xl shadow-emerald-200">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleApplicationPage;