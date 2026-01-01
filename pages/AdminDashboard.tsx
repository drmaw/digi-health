import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile, AuditLog, Organization } from '../../types';

/* =========================
   Admin Dashboard
========================= */

const AdminDashboard: React.FC = () => {
  const {
    users = [],
    organizations = [],
    auditLogs = [],
    approveRole,
    suspendRole,
    unsuspendRole,
    removeRole,
    extendOrganizationExpiry,
    updateOrganizationStatus,
    updateUser
  } = useApp();

  const [activeTab, setActiveTab] =
    useState<'overview' | 'users' | 'staff' | 'orgs' | 'approvals' | 'audit'>('overview');
  const [search, setSearch] = useState('');
  const [extensionMonths, setExtensionMonths] = useState<Record<string, number>>({});

  /* =========================
     Derived Data
  ========================= */

  const pendingApprovals = users.flatMap(u =>
    u.appliedRoles
      ?.filter(r => r.status === 'pending')
      .map(r => ({ user: u, role: r.role }))
  );

  const staffUsers = users.filter(u => u.activeRoles.length > 1);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        u =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.healthId?.includes(search) ||
          u.phone?.includes(search)
      ),
    [users, search]
  );

  const filteredStaff = useMemo(
    () =>
      staffUsers.filter(
        u =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.healthId?.includes(search)
      ),
    [staffUsers, search]
  );

  const filteredOrgs = useMemo(
    () =>
      organizations.filter(
        o =>
          o.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.registrationNumber?.toLowerCase().includes(search.toLowerCase())
      ),
    [organizations, search]
  );

  const filteredAudit = useMemo(
    () =>
      !search
        ? auditLogs
        : auditLogs.filter(
            l =>
              l.actorName?.toLowerCase().includes(search.toLowerCase()) ||
              l.details?.toLowerCase().includes(search.toLowerCase())
          ),
    [auditLogs, search]
  );

  /* =========================
     Render
  ========================= */

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          🛡️ Admin Console
        </h1>

        <div className="flex gap-2 overflow-x-auto">
          {[
            ['overview', '📊 Stats'],
            ['users', '👥 Users'],
            ['staff', '🩺 Staff'],
            ['orgs', '🏢 Clinics'],
            ['approvals', `⏳ Approvals (${pendingApprovals.length})`],
            ['audit', '📜 Audit']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as any);
                setSearch('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black ${
                activeTab === id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      {activeTab !== 'overview' && (
        <input
          className="ui-input h-14 text-lg font-bold"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {/* =========================
          Overview
      ========================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Stat label="Total Users" value={users.length} />
          <Stat label="Medical Staff" value={staffUsers.length} />
          <Stat label="Organizations" value={organizations.length} />
          <Stat label="Audit Logs" value={auditLogs.length} />
        </div>
      )}

      {/* =========================
          Users / Staff
      ========================= */}
      {(activeTab === 'users' || activeTab === 'staff') && (
        <Section>
          {(activeTab === 'users' ? filteredUsers : filteredStaff).length > 0 ? (
            (activeTab === 'users' ? filteredUsers : filteredStaff).map(u => (
              <UserRow key={u.id} user={u} suspendRole={suspendRole} />
            ))
          ) : (
            <EmptyState title="No users found" />
          )}
        </Section>
      )}

      {/* =========================
          Organizations
      ========================= */}
      {activeTab === 'orgs' && (
        <Section>
          {filteredOrgs.length > 0 ? (
            filteredOrgs.map(o => (
              <OrgCard
                key={o.id}
                org={o}
                months={extensionMonths[o.id] || 6}
                setMonths={m => setExtensionMonths(p => ({ ...p, [o.id]: m }))}
                extend={() => extendOrganizationExpiry(o.id, extensionMonths[o.id] || 6)}
              />
            ))
          ) : (
            <EmptyState title="No organizations found" />
          )}
        </Section>
      )}

      {/* =========================
          Approvals
      ========================= */}
      {activeTab === 'approvals' && (
        <Section>
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map((p, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border flex justify-between">
                <div>
                  <p className="font-black">{p.user.name}</p>
                  <p className="text-xs text-slate-400">{p.role}</p>
                </div>
                <button
                  onClick={() => approveRole(p.user.id, p.role)}
                  className="ui-btn ui-btn-primary"
                >
                  Approve
                </button>
              </div>
            ))
          ) : (
            <EmptyState title="No pending approvals" />
          )}
        </Section>
      )}

      {/* =========================
          Audit
      ========================= */}
      {activeTab === 'audit' && (
        <Section>
          {filteredAudit.length > 0 ? (
            filteredAudit.map(l => <AuditRow key={l.id} log={l} />)
          ) : (
            <EmptyState title="No audit activity yet" />
          )}
        </Section>
      )}
    </div>
  );
};

/* =========================
   Helper Components
========================= */

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

const EmptyState = ({ title }: { title: string }) => (
  <div className="bg-white p-20 rounded-3xl border text-center">
    <p className="text-xl font-black text-slate-300">{title}</p>
    <p className="text-slate-400 font-bold mt-2">
      This section will populate automatically.
    </p>
  </div>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white p-6 rounded-3xl border">
    <p className="text-xs font-black text-slate-400 uppercase">{label}</p>
    <p className="text-4xl font-black text-slate-900">{value}</p>
  </div>
);

const UserRow = ({
  user,
  suspendRole
}: {
  user: UserProfile;
  suspendRole: any;
}) => (
  <div className="bg-white p-6 rounded-2xl border flex justify-between items-center">
    <div>
      <p className="font-black">{user.name}</p>
      <p className="text-xs font-mono text-emerald-600">{user.healthId}</p>
    </div>
    {user.activeRoles
      .filter(r => r !== UserRole.PATIENT)
      .map(r => (
        <button
          key={r}
          onClick={() => suspendRole(user.id, r)}
          className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg"
        >
          Hold {r}
        </button>
      ))}
  </div>
);

const OrgCard = ({
  org,
  months,
  setMonths,
  extend
}: {
  org: Organization;
  months: number;
  setMonths: (m: number) => void;
  extend: () => void;
}) => (
  <div className="bg-white p-6 rounded-2xl border flex justify-between items-center">
    <div>
      <p className="font-black">{org.name}</p>
      <p className="text-xs text-slate-400">
        Expires {new Date(org.expiresAt).toLocaleDateString()}
      </p>
    </div>
    <button onClick={extend} className="ui-btn ui-btn-primary">
      Extend +{months} mo
    </button>
  </div>
);

const AuditRow = ({ log }: { log: AuditLog }) => (
  <div className="bg-white p-6 rounded-2xl border">
    <p className="text-sm font-black">
      {log.actorName} → {log.action}
    </p>
    <p className="text-xs text-slate-400">{log.details}</p>
  </div>
);

export default AdminDashboard;