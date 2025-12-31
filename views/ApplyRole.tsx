
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

const ApplyRole: React.FC = () => {
  const { applyForRole, currentUser } = useApp();
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);
  const [details, setDetails] = useState('');
  // Added regNumber state to satisfy the 3-argument requirement of applyForRole in AppContext
  const [regNumber, setRegNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Passing role, details, and regNumber to applyForRole to match its expected parameters
    applyForRole(role, details, regNumber);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="p-10 text-center space-y-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-2xl font-bold">Submitted Successfully</h2>
      <p className="text-slate-500">Administrators will verify your credentials soon.</p>
      <button onClick={() => setSubmitted(false)} className="ui-btn ui-btn-primary">Apply for another</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="ui-card space-y-6">
        <h2 className="text-2xl font-bold">Professional Application</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="ui-label">Role to apply for</label>
            <select 
              className="ui-input bg-white" 
              value={role} 
              onChange={e => setRole(e.target.value as UserRole)}
            >
              <option value={UserRole.DOCTOR}>Doctor</option>
              <option value={UserRole.NURSE}>Nurse</option>
              <option value={UserRole.PATHOLOGIST}>Pathologist</option>
              <option value={UserRole.ORG_OWNER}>Organization Owner</option>
            </select>
          </div>
          <div>
            {/* Added registration number input field */}
            <label className="ui-label">Registration Number</label>
            <input 
              type="text"
              className="ui-input"
              required
              placeholder="Enter your professional registration number..."
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="ui-label">Professional Details (Org Name, Experience, etc)</label>
            <textarea 
              className="ui-input h-32" 
              required
              placeholder="Provide necessary information for approval..."
              value={details}
              onChange={e => setDetails(e.target.value)}
            />
          </div>
          <button type="submit" className="ui-btn ui-btn-primary w-full py-4 text-lg">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default ApplyRole;
