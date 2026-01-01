import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile, AuditLog, Organization } from '../types';

const AdminDashboard: React.FC = () => {
  const { 
    users, 
    organizations, 
    auditLogs, 
    approveRole, 
    suspendRole, 
    unsuspendRole, 
    removeRole, 
    extendOrganizationExpiry,
    updateOrganizationStatus,
    updateUser,
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orgs' | 'approvals' | 'audit' | 'staff'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [extensionMonths, setExtensionMonths] = useState<Record<string, number>>({});

  const pending = users.flatMap(u => 
    u.appliedRoles.filter(a => a.status === 'pending').map(a => ({ 
      user: u, role: a.role, details: a.details, regNumber: a.registrationNumber 
    }))
  );
  const expiredOrgs = organizations.filter(o => new Date(o.expiresAt) < new Date() || o.status === 'revoked');
  const staffUsers = users.filter(u => u.activeRoles.length > 1);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.healthId.includes(searchQuery) || 
      u.phone.includes(searchQuery)
    );
  }, [users, searchQuery]);

  const filteredOrgs = useMemo(() => {
    return organizations.filter(o => 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  const filteredStaff = useMemo(() => {
    return staffUsers.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.healthId.includes(searchQuery)
    );
  }, [staffUsers, searchQuery]);

  const filteredAuditLogs = useMemo(() => {
    if (!searchQuery) return auditLogs;
    return auditLogs.filter(log => 
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [auditLogs, searchQuery]);

  const handleExtend = (orgId: string) => {
    const months = extensionMonths[orgId] || 6;
    extendOrganizationExpiry(orgId, months);
  };

  const setMonths = (orgId: string, m: number) => {
    setExtensionMonths(prev => ({ ...prev, [orgId]: m }));
  };

  const handleUpdateLimit = (user: UserProfile, newLimit: number) => {
    updateUser({ ...user, recordViewLimit: newLimit });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border shadow-sm sticky top-0 z-40">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-emerald-600">🛡️</span> Admin Console
          </h2>
        </div>
        
        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Stats', icon: '📊' },
            { id: 'users', label: 'All Users', icon: '👥' },
            { id: 'staff', label: 'Medical Staff', icon: '🩺' },
            { id: 'orgs', label: 'Clinics', icon: '🏢' },
            { id: 'approvals', label: `Queue (${pending.length})`, icon: '⏳' },
            { id: 'audit', label: 'Audit', icon: '📜' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab !== 'overview' && activeTab !== 'approvals' && (
        <div className="relative group max-w-2xl mx-auto">
          <input 
            type="text" 
            className="ui-input h-14 pl-14 pr-6 text-lg font-bold shadow-sm"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
          <ClickableStat 
            label="Total Patients" 
            value={users.length} 
            color="emerald" 
            icon="👥" 
            onClick={() => setActiveTab('users')}
          />
          <ClickableStat 
            label="Medical Staff" 
            value={staffUsers.length} 
            color="blue" 
            icon="🩺" 
            onClick={() => setActiveTab('staff')}
          />
          <ClickableStat 
            label="Active Clinics" 
            value={organizations.length} 
            color="indigo" 
            icon="🏢" 
            onClick={() => setActiveTab('orgs')}
          />
          <ClickableStat 
            label="Expired Licenses" 
            value={expiredOrgs.length} 
            color="red" 
            icon="⚠️" 
            onClick={() => setActiveTab('orgs')}
          />
        </div>
      )}

      {(activeTab === 'users' || activeTab === 'staff') && (
        <div className="grid grid-cols-1 gap-4">
          {/* Governance: Sections remain visible to reflect system capability even when unused. */}
          {((activeTab === 'users' ? filteredUsers : filteredStaff).length > 0) ? (
            (activeTab === 'users' ? filteredUsers : filteredStaff).map(user => (
              <AdminUserRow 
                key={user.id} 
                user={user} 
                onSuspend={suspendRole} 
                onRestore={unsuspendRole} 
                onRemove={removeRole}
                onApprove={approveRole}
                onUpdateLimit={(limit) => handleUpdateLimit(user, limit)}
              />
            ))
          ) : (
            <EmptyState 
              title={`No ${activeTab === 'users' ? 'users' : 'staff'} found`} 
              message="This section will populate automatically when data is available." 
            />
          )}
        </div>
      )}

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
    <h3 className="text-xl font-black text-slate-300">{title}</h3>
    <p className="text-slate-400 font-bold mt-2">{message}</p>
  </div>
);


      {activeTab === 'orgs' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Governance: Sections remain visible to reflect system capability even when unused. */}
          {(filteredOrgs.length > 0) ? (
            filteredOrgs.map(org => (
              <AdminOrgCard 
                key={org.id} 
                org={org} 
                extensionMonths={extensionMonths[org.id] || 6}
                setMonths={(m) => setMonths(org.id, m)}
                onExtend={() => handleExtend(org.id)}
                onUpdateStatus={(s) => updateOrganizationStatus(org.id, s)}
              />
            ))
          ) : (
            <EmptyState 
              title="No organizations found" 
              message="This section will populate automatically when data is available." 
            />
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Governance: Sections remain visible to reflect system capability even when unused. */}
          {(pending.length > 0) ? (
            pending.map((app, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <img src={app.user.photoUrl} className="w-16 h-16 rounded-2xl shadow-sm border" alt="" />
                  <div>
                    <p className="font-black text-slate-900 text-lg">{app.user.name}</p>
                    <span className="ui-badge bg-blue-100 text-blue-700">{app.role}</span>
                  </div>
                </div>
                <button onClick={() => approveRole(app.user.id, app.role)} className="ui-btn ui-btn-primary">Approve</button>
              </div>
            ))
          ) : (
            <EmptyState 
              title="No pending approvals" 
              message="This section will populate automatically when new role applications are submitted." 
            />
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden">
          {/* Governance: Sections remain visible to reflect system capability even when unused. */}
          {(filteredAuditLogs.length > 0) ? (
          {(filteredAuditLogs.length > 0) ? (
           <div className="divide-y">
              {filteredAuditLogs.map(log => (
                <AuditLogRow key={log.id} log={log} />
              ))}
           </div>
          ) : (
            <EmptyState 
              title="No audit activity recorded" 
              message="This section will populate automatically when system actions occur." 
            />
          )}
        </div>
      )}
    </div>
  );
};

const ClickableStat: React.FC<{ label: string, value: number, color: string, icon: string, onClick: () => void }> = ({ label, value, color, icon, onClick }) => {
  const themes: any = {
    emerald: 'from-emerald-500 to-teal-600 text-emerald-100',
    blue: 'from-blue-500 to-indigo-600 text-blue-100',
    indigo: 'from-indigo-500 to-purple-600 text-indigo-100',
    red: 'from-red-500 to-rose-600 text-red-100'
  };
  return (
    <button onClick={onClick} className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${themes[color]} text-left border border-white/10 group overflow-hidden`}>
      <span className="text-4xl mb-4 block">{icon}</span>
      <p className="text-xs font-black uppercase tracking-widest opacity-80">{label}</p>
      <p className="text-4xl font-black text-white mt-1">{value}</p>
    </button>
  );
};

const AdminUserRow: React.FC<{ 
  user: UserProfile, 
  onSuspend: any, 
  onRestore: any, 
  onRemove: any,
  onApprove: any,
  onUpdateLimit: (limit: number) => void
}> = ({ user, onSuspend, onRestore, onRemove, onApprove, onUpdateLimit }) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-5">
        <img src={user.photoUrl} className="w-16 h-16 rounded-2xl" alt="" />
        <div>
          <p className="font-black text-slate-900 text-lg">{user.name}</p>
          <span className="text-[10px] font-mono text-emerald-600 font-bold">{user.healthId}</span>
        </div>
      </div>
      <div className="flex gap-2">
         {user.activeRoles.map(role => role !== UserRole.PATIENT && (
           <button key={role} onClick={() => onSuspend(user.id, role)} className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">Hold {role}</button>
         ))}
      </div>
    </div>
  );
};

const AdminOrgCard: React.FC<{ 
  org: Organization, 
  extensionMonths: number, 
  setMonths: (m: number) => void, 
  onExtend: () => void,
  onUpdateStatus: (status: any) => void
}> = ({ org, extensionMonths, setMonths, onExtend, onUpdateStatus }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex justify-between items-center">
      <div>
        <h4 className="text-xl font-black text-slate-900">{org.name}</h4>
        <p className="text-xs text-slate-400 font-bold">Expires: {new Date(org.expiresAt).toLocaleDateString()}</p>
      </div>
      <button onClick={onExtend} className="ui-btn ui-btn-primary py-2 px-6 text-xs">Extend +{extensionMonths}mo</button>
    </div>
  );
};

const AuditLogRow: React.FC<{ log: AuditLog }> = ({ log }) => (
  <div className="p-6 hover:bg-slate-50 transition-colors">
    <p className="text-sm font-black text-slate-800">
      <span className="text-blue-600">{log.actorName}</span> (Role: <span className="text-purple-600">{log.actorRole || 'N/A'}</span>) → <span className="text-emerald-600">{log.action}</span>
      {log.targetType && log.targetId && (
        <> → {log.targetType}: <span className="font-mono text-slate-600">{log.targetName || log.targetId}</span></>
      )}
      : {log.details}
    </p>
    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
  </div>
);

export default AdminDashboard;