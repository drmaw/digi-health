import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, MedicalRecord, UserRole, Organization, 
  AuditLog, Investigation, Appointment, DoctorSchedule, FinancialEntry, OrgStatus 
} from './types';
import { auth, db, githubProvider } from './firebase';
import { translations, Language } from './utils/translations';
import { generateHealthId } from './utils/helpers';

interface AppContextType {
  currentUser: UserProfile | null;
  users: UserProfile[];
  organizations: Organization[];
  auditLogs: AuditLog[];
  investigations: Investigation[];
  appointments: Appointment[];
  schedules: DoctorSchedule[];
  records: MedicalRecord[];
  isLoading: boolean;
  lang: Language;
  t: (key: string) => string;
  setLang: (l: Language) => void;
  signUp: (email: string, pass: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => Promise<void>;
  uploadRecord: (title: string, dataUrl: string) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
    addLog: (action: string, details: string, options?: { targetType?: "User" | "Organization" | "Record" | null; targetId?: string | null; orgId?: string; targetName?: string; }) => Promise<void>;
  applyForRole: (role: UserRole, details: string, regNumber: string) => Promise<string | null>;
  approveRole: (userId: string, role: UserRole) => Promise<void>;
  suspendRole: (userId: string, role: UserRole) => Promise<void>;
  unsuspendRole: (userId: string, role: UserRole) => Promise<void>;
  removeRole: (userId: string, role: UserRole) => Promise<void>;
  recruitStaff: (orgId: string, userId: string, role: UserRole) => Promise<void>;
  updateBedStatus: (orgId: string, bedId: string, isOccupied: boolean, patientId?: string) => Promise<void>;
  bookAppointment: (data: { orgId: string, doctorId: string, patientId: string, date: string }) => Promise<void>;
  completeInvestigation: (id: string, findings: string, reportFileUrl?: string) => Promise<void>;
  addFinancialEntry: (orgId: string, entry: Partial<FinancialEntry>) => Promise<void>;
  resetLedger: (orgId: string) => Promise<void>;
  extendOrganizationExpiry: (orgId: string, months: number) => Promise<void>;
  updateOrganizationStatus: (orgId: string, status: OrgStatus) => Promise<void>;
  addSchedule: (schedule: Omit<DoctorSchedule, 'id'>) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
  updateSchedule: (schedule: DoctorSchedule) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<Language>('bn');

  const t = (key: string) => translations[lang][key] || key;

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setIsLoading(true);
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) setCurrentUser(userDoc.data() as UserProfile);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsubUsers = db.collection('users').onSnapshot(s => setUsers(s.docs.map(d => d.data() as UserProfile)));
    const unsubOrgs = db.collection('organizations').onSnapshot(s => setOrganizations(s.docs.map(d => ({ id: d.id, ...d.data() } as Organization))));
    const unsubLogs = db.collection('auditLogs').orderBy('timestamp', 'desc').limit(100).onSnapshot(s => setAuditLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog))));
    const unsubApts = db.collection('appointments').onSnapshot(s => setAppointments(s.docs.map(d => ({ id: d.id, ...d.data() } as Appointment))));
    const unsubSchedules = db.collection('schedules').onSnapshot(s => setSchedules(s.docs.map(d => ({ id: d.id, ...d.data() } as DoctorSchedule))));
    const unsubRecords = db.collection('records').where('patientId', '==', currentUser.id).onSnapshot(s => setRecords(s.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord))));
    const unsubInvs = db.collection('investigations').onSnapshot(s => setInvestigations(s.docs.map(d => ({ id: d.id, ...d.data() } as Investigation))));
    return () => { unsubUsers(); unsubOrgs(); unsubLogs(); unsubApts(); unsubSchedules(); unsubRecords(); unsubInvs(); };
  }, [currentUser]);

  const signUp = async (email: string, pass: string, name: string, phone: string) => {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    const healthId = generateHealthId();
    const newUser: UserProfile = {
      id: cred.user!.uid, healthId, name, phone, email, gender: 'Other', age: 0, bloodGroup: 'N/A',
      chronicConditions: { hypertension: false, diabetes: false, asthma: false },
      emergencyContacts: [], activeRoles: [UserRole.PATIENT], suspendedRoles: [], appliedRoles: [], recordViewLimit: 10
    };
    await db.collection('users').doc(cred.user!.uid).set(newUser);
  };

  const signIn = async (email: string, pass: string) => { await auth.signInWithEmailAndPassword(email, pass); };

  const signInWithGithub = async () => {
    const result = await auth.signInWithPopup(githubProvider);
    const user = result.user;
    if (user) {
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        const newUser: UserProfile = {
          id: user.uid, healthId: generateHealthId(), name: user.displayName || 'GitHub User', phone: 'N/A', email: user.email || '', gender: 'Other', age: 0, bloodGroup: 'N/A',
          chronicConditions: { hypertension: false, diabetes: false, asthma: false },
          emergencyContacts: [], activeRoles: [UserRole.PATIENT], suspendedRoles: [], appliedRoles: [], recordViewLimit: 10, photoUrl: user.photoURL || undefined
        };
        await userDocRef.set(newUser);
      }
    }
  };

  const logout = async () => await auth.signOut();
  const updateUser = async (user: UserProfile) => await db.collection('users').doc(user.id).update({ ...user });
  const uploadRecord = async (title: string, dataUrl: string) => {
    if (!currentUser) return;
    await db.collection('records').add({ patientId: currentUser.id, title, fileUrl: dataUrl, fileType: 'image', uploadedAt: new Date().toISOString(), isHidden: false });
    // Governance: Patient data record creation is logged for accountability.
    addLog('RECORD_CREATED', `Patient data record created: ${title}`, { targetType: 'Record', targetId: currentUser.id, targetName: currentUser.name });
  };
  const deleteRecord = async (id: string) => {
    // Governance: Patient data record deletion is logged for accountability.
    addLog('RECORD_DELETED', `Patient data record deleted: ${id}`, { targetType: 'Record', targetId: id });
    await db.collection('records').doc(id).delete();
  };
  const addLog = async (action: string, details: string, options: { targetType?: "User" | "Organization" | "Record" | null; targetId?: string | null; orgId?: string; targetName?: string; } = {}) => {
    if (!currentUser) return;
    
    // Part of governance and compliance is to log who did what and when.
    // This provides an immutable audit trail for all significant actions within the system.
    // It's crucial for accountability, security analysis, and regulatory compliance.
    await db.collection('auditLogs').add({
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.activeRoles.join(', '),
      action,
      details,
      targetType: options.targetType || null,
      targetId: options.targetId || null,
      targetName: options.targetName || null,
      orgId: options.orgId || null,
    });
  };
  const applyForRole = async (role: UserRole, details: string, regNumber: string) => {
    if (!currentUser) return 'Not logged in';
    const updatedAppliedRoles = [...(currentUser.appliedRoles || []), { role, status: 'pending' as const, details, registrationNumber: regNumber }];
    await updateUser({ ...currentUser, appliedRoles: updatedAppliedRoles });
    return null;
  };
  const approveRole = async (userId: string, role: UserRole) => {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    const user = userDoc.data() as UserProfile;
    const activeRoles = Array.from(new Set([...user.activeRoles, role]));
    const appliedRoles = user.appliedRoles.map(a => a.role === role ? { ...a, status: 'approved' as const } : a);
    await db.collection('users').doc(userId).update({ activeRoles, appliedRoles });
    
    // Governance: Log role approval for traceability
    addLog("ROLE_APPROVED", `Approved role ${role} for ${user.name}`, { targetType: 'User', targetId: userId, targetName: user.name });

    if (role === UserRole.ORG_OWNER) {
      const newOrgRef = await db.collection('organizations').add({ ownerId: userId, name: 'New Facility', registrationNumber: 'DGHS-PENDING', location: 'TBD', status: 'active', beds: [], pricing: [], staff: [], ledger: [], reports: [], createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 15552000000).toISOString() });
      // Governance: Log organization creation for traceability
      addLog("ORG_CREATED", `New organization created by ${user.name}`, { targetType: 'Organization', targetId: newOrgRef.id, orgId: newOrgRef.id, targetName: 'New Facility' });
    }
  };
  const suspendRole = async (userId: string, role: UserRole) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const user = userDoc.data() as UserProfile;
      const activeRoles = user.activeRoles.filter(r => r !== role);
      const suspendedRoles = Array.from(new Set([...(user.suspendedRoles || []), role]));
      await userRef.update({ activeRoles, suspendedRoles });
      // Governance: Log role suspension for traceability
      addLog('ROLE_SUSPENDED', `Suspended role ${role} for ${user.name}`, { targetType: 'User', targetId: user.id, targetName: user.name });
    }
  };
  const unsuspendRole = async (userId: string, role: UserRole) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const user = userDoc.data() as UserProfile;
      const suspendedRoles = (user.suspendedRoles || []).filter(r => r !== role);
      const activeRoles = Array.from(new Set([...user.activeRoles, role]));
      await userRef.update({ activeRoles, suspendedRoles });
      // Governance: Log role restoration for traceability
      addLog('ROLE_RESTORED', `Restored role ${role} for ${user.name}`, { targetType: 'User', targetId: user.id, targetName: user.name });
    }
  };
  const removeRole = async (userId: string, role: UserRole) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const user = userDoc.data() as UserProfile;
      const activeRoles = user.activeRoles.filter(r => r !== role);
      const suspendedRoles = (user.suspendedRoles || []).filter(r => r !== role);
      await userRef.update({ activeRoles, suspendedRoles });
      // Governance: Log role removal for traceability
      addLog('ROLE_REMOVED', `Removed role ${role} for ${user.name}`, { targetType: 'User', targetId: user.id, targetName: user.name });
    }
  };
  const recruitStaff = async (orgId: string, userId: string, role: UserRole) => {
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (orgDoc.exists) {
      const org = orgDoc.data() as Organization;
      const updatedStaff = [...(org.staff || []), { userId, role, status: 'accepted' as const }];
      await orgRef.update({ staff: updatedStaff });
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const user = userDoc.data() as UserProfile;
        const activeRoles = Array.from(new Set([...user.activeRoles, role]));
        await db.collection('users').doc(userId).update({ activeRoles });
      }
      // Governance: Log staff recruitment for traceability
      addLog('STAFF_RECRUITED', `Recruited ${user.name} as ${role} for ${org.name}`, { targetType: 'User', targetId: userId, targetName: user.name, orgId });
    }
  };
  const updateBedStatus = async (orgId: string, bedId: string, isOccupied: boolean, patientId?: string) => {
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (orgDoc.exists) {
      const org = orgDoc.data() as Organization;
      const updatedBeds = (org.beds || []).map(b => b.id === bedId ? { ...b, isOccupied, currentPatientId: patientId } : b);
      await orgRef.update({ beds: updatedBeds });
      addLog('BED_UPDATE', `Updated status of bed ${bedId} at ${org.name}`, { targetType: 'Organization', targetId: orgId, targetName: org.name, orgId });
    }
  };
  const bookAppointment = async (data: { orgId: string, doctorId: string, patientId: string, date: string }) => {
    const count = appointments.filter(a => a.doctorId === data.doctorId && a.date.split('T')[0] === data.date.split('T')[0]).length;
    await db.collection('appointments').add({ ...data, status: 'scheduled', serialNumber: count + 1, createdAt: new Date().toISOString() });
    addLog('APPOINTMENT_BOOKED', `New appointment booked for patient ${data.patientId} with doctor ${data.doctorId}`, { targetType: 'User', targetId: data.patientId, orgId: data.orgId });
  };
  const completeInvestigation = async (id: string, findings: string, url?: string) => {
    const invRef = db.collection('investigations').doc(id);
    const invDoc = await invRef.get();
    if (invDoc.exists) {
      const inv = invDoc.data() as Investigation;
      await invRef.update({ status: 'Completed', findings, reportFileUrl: url || null, completedAt: new Date().toISOString() });
      addLog('INVESTIGATION_COMPLETED', `Completed investigation for patient ${inv.patientId}`, { targetType: 'User', targetId: inv.patientId, orgId: inv.orgId });
    }
  };
  const addFinancialEntry = async (orgId: string, entry: Partial<FinancialEntry>) => {
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (orgDoc.exists) {
      const org = orgDoc.data() as Organization;
      const newEntry: FinancialEntry = { id: `fin-${Date.now()}`, timestamp: new Date().toISOString(), actorId: currentUser?.id || 'sys', type: entry.type || 'credit', amount: entry.amount || 0, note: entry.note || '' };
      await orgRef.update({ ledger: [...(org.ledger || []), newEntry] });
      addLog('FINANCIAL_ENTRY', `Added financial entry: ${entry.note}`, { targetType: 'Organization', targetId: orgId, targetName: org.name, orgId });
    }
  };
  const resetLedger = async (orgId: string) => {
    await db.collection('organizations').doc(orgId).update({ ledger: [] });
    addLog('LEDGER_RESET', `Ledger has been cleared for session restart`, { targetType: 'Organization', targetId: orgId, orgId });
  };
  const extendOrganizationExpiry = async (orgId: string, months: number) => {
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (orgDoc.exists) {
      const org = orgDoc.data() as Organization;
      const current = new Date(org.expiresAt);
      current.setMonth(current.getMonth() + months);
      await orgRef.update({ expiresAt: current.toISOString() });
      // Governance: Log license extension for traceability
      addLog('LICENSE_EXTENDED', `Extended organization license by ${months} months for ${org.name}`, { targetType: 'Organization', targetId: orgId, targetName: org.name });
    }
  };
  const updateOrganizationStatus = async (orgId: string, status: OrgStatus) => {
    await db.collection('organizations').doc(orgId).update({ status });
    // Governance: Log organization status update for traceability
    addLog('ORG_STATUS_UPDATE', `Organization status set to ${status}`, { targetType: 'Organization', targetId: orgId });
  };
  
  const addSchedule = async (s: Omit<DoctorSchedule, 'id'>) => { 
    await db.collection('schedules').add(s); 
    addLog('SCHEDULE_ADDED', `New visiting schedule configured for doctor ${s.doctorId}`, { targetType: 'User', targetId: s.doctorId, orgId: s.orgId });
  };
  
  const removeSchedule = async (id: string) => {
    const schRef = db.collection('schedules').doc(id);
    const schDoc = await schRef.get();
    if (schDoc.exists) {
      const s = schDoc.data() as DoctorSchedule;
      await schRef.delete();
      addLog('SCHEDULE_REMOVED', `Schedule entry deleted for doctor ${s.doctorId}`, { targetType: 'User', targetId: s.doctorId, orgId: s.orgId });
    }
  };
  const updateSchedule = async (s: DoctorSchedule) => { 
    const { id, ...rest } = s; 
    await db.collection('schedules').doc(id).update(rest); 
    addLog('SCHEDULE_UPDATED', `Existing schedule modified for doctor ${s.doctorId}`, { targetType: 'User', targetId: s.doctorId, orgId: s.orgId });
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, organizations, auditLogs, investigations, appointments, schedules, records, isLoading, lang, t, setLang,
      signUp, signIn, signInWithGithub, logout, updateUser, uploadRecord, deleteRecord, addLog, applyForRole, approveRole,
      suspendRole, unsuspendRole, removeRole, recruitStaff, updateBedStatus, bookAppointment, completeInvestigation, addFinancialEntry,
      resetLedger, extendOrganizationExpiry, updateOrganizationStatus, removeSchedule, addSchedule, updateSchedule
    }}>
      {children}
    </AppContext.Provider>
  );
};