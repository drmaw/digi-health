
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';

const AdminPanel: React.FC = () => {
  const { users, organizations, approveRole } = useApp();
  const [tab, setTab] = useState<'stats' | 'approvals'>('stats');

  const pending = users.flatMap(u => 
    u.appliedRoles.filter(a => a.status === 'pending').map(a => ({ user: u, role: a.role, details: a.details }))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Console</h2>
        <div className="flex bg-white rounded-lg border p-1">
          <button onClick={() => setTab('stats')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${tab === 'stats' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>Stats</button>
          <button onClick={() => setTab('approvals')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${tab === 'approvals' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
            Approvals ({pending.length})
          </button>
        </div>
      </div>

      {tab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatMini label="Patients" value={users.length} />
          <StatMini label="Clinics" value={organizations.length} />
          <StatMini label="Staff" value={users.filter(u => u.activeRoles.length > 1).length} />
          <StatMini label="Active" value={84} />
        </div>
      )}

      {tab === 'approvals' && (
        <div className="space-y-4">
          {pending.map((app, idx) => (
            <div key={idx} className="ui-card flex justify-between items-center">
              <div>
                <p className="font-bold">{app.user.name}</p>
                <p className="ui-badge bg-blue-100 text-blue-700">{app.role}</p>
                <p className="text-xs text-slate-500 mt-2">{app.details}</p>
              </div>
              <button onClick={() => approveRole(app.user.id, app.role)} className="ui-btn ui-btn-primary">Approve</button>
            </div>
          ))}
          {pending.length === 0 && <p className="text-center text-slate-400 py-20">No pending approvals.</p>}
        </div>
      )}
    </div>
  );
};

const StatMini = ({ label, value }: { label: string, value: number }) => (
  <div className="ui-card text-center">
    <p className="text-2xl font-bold">{value}</p>
    <p className="ui-label m-0">{label}</p>
  </div>
);

export default AdminPanel;
