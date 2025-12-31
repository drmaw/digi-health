import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserRole, Organization } from '../types';
import StaffDashboardNurse from './StaffDashboardNurse';
import StaffDashboardPathology from './StaffDashboardPathology';
import StaffDashboardGeneral from './StaffDashboardGeneral';

export default function StaffDashboard() {
  const { currentUser, organizations, t } = useApp();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  const staffRoles = currentUser?.activeRoles.filter(r => 
    [UserRole.NURSE, UserRole.PATHOLOGIST, UserRole.MANAGER, UserRole.LAB_TECHNICIAN, UserRole.FRONT_DESK].includes(r)
  ) || [];

  useEffect(() => {
    if (staffRoles.length > 0 && !activeRole) {
      if (staffRoles.includes(UserRole.NURSE)) setActiveRole(UserRole.NURSE);
      else if (staffRoles.includes(UserRole.PATHOLOGIST)) setActiveRole(UserRole.PATHOLOGIST);
      else setActiveRole(staffRoles[0]);
    }
  }, [staffRoles, activeRole]);

  const org = organizations.find(o => 
    o.staff.some(s => s.userId === currentUser?.id)
  ) || (organizations.length > 0 ? organizations[0] : null);

  if (!org) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl">🏢</div>
        <p className="font-black text-slate-400">No active organization affiliation found.</p>
      </div>
    </div>
  );

  const isExpired = new Date(org.expiresAt) < new Date();
  const isRevoked = org.status === 'revoked';
  const isSuspended = org.status === 'suspended';
  const isOrgInactive = isRevoked || isSuspended || isExpired;

  if (!activeRole) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl">🚫</div>
        <p className="font-black text-slate-400">No staff roles assigned.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {isOrgInactive && (
        <div className="absolute inset-0 z-[200] bg-slate-50/60 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-4 border-slate-100 max-w-xl text-center space-y-8 animate-in zoom-in duration-500">
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto text-5xl shadow-xl
                ${isRevoked ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                {isRevoked ? '🚫' : '⏸️'}
              </div>
              <div className="space-y-4">
                 <h2 className="text-3xl font-black text-slate-900 leading-tight">
                   {isRevoked ? 'Operations Terminated' : isSuspended ? 'Operations On Hold' : 'License Expired'}
                 </h2>
                 <p className="text-slate-500 font-bold leading-relaxed">
                   {isRevoked ? 'This organization\'s clinical license has been permanently revoked by the System Admin.' : 
                    isSuspended ? 'This organization is currently under administrative review.' : 
                    'The facility license has expired. Please contact the Organization Owner for renewal.'}
                 </p>
              </div>
           </div>
        </div>
      )}

      {staffRoles.length > 1 && !isOrgInactive && (
        <div className="flex justify-center">
          <div className="bg-white p-1.5 rounded-2xl border shadow-sm flex gap-1">
            {staffRoles.map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeRole === role ? 'bg-emerald-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeRole === UserRole.NURSE && <StaffDashboardNurse org={org} />}
      {activeRole === UserRole.PATHOLOGIST && <StaffDashboardPathology org={org} />}
      {(activeRole === UserRole.MANAGER || activeRole === UserRole.FRONT_DESK || activeRole === UserRole.LAB_TECHNICIAN) && (
        <StaffDashboardGeneral org={org} role={activeRole} />
      )}
    </div>
  );
}