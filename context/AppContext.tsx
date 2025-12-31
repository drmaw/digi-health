
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserProfile, 
  MedicalRecord, 
  UserRole, 
  Organization, 
  AuditLog, 
  Investigation, 
  Appointment, 
  DoctorSchedule, 
  FinancialEntry,
  OrgStatus
} from '../types';
// Fix: Removed modular Firebase imports and using exported instances from firebase.ts
import { auth, db, githubProvider } from '../firebase';
import { translations, Language } from '../utils/translations';
import { generateHealthId } from '../utils/helpers';

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
  addLog: (action: string, details: string, targetId?: string, targetName?: string) => Promise<void>;
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
    // Fix: Using Firebase v8 auth.onAuthStateChanged
    const unsub = auth.onAuthStateChanged(async (user) => {
      setIsLoading(true);
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setCurrentUser(userDoc.data() as UserProfile);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Fix: Using Firebase v8 db.collection().onSnapshot() and methods
    const unsubUsers = db.collection('users').onSnapshot((snap) => {
      setUsers(snap.docs.map(d => d.data() as UserProfile));
    });

    const unsubOrgs = db.collection('organizations').onSnapshot((snap) => {
      setOrganizations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Organization)));
    });

    const unsubLogs = db.collection('auditLogs')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot((snap) => {
        setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog)));
      });

    const unsubApts = db.collection('appointments').onSnapshot((snap) => {
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)));
    });

    const unsubSchedules = db.collection('schedules').onSnapshot((snap) => {
      setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorSchedule)));
    });

    const unsubRecords = db.collection('records')
      .where('patientId', '==', currentUser.id)
      .onSnapshot((snap) => {
        setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord)));
      });

    const unsubInvs = db.collection('investigations').onSnapshot((snap) => {
      setInvestigations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Investigation)));
    });

    return () => {
      unsubUsers(); unsubOrgs(); unsubLogs(); unsubApts(); unsubSchedules(); unsubRecords(); unsubInvs();
    };
  }, [currentUser]);

  const signUp = async (email: string, pass: string, name: string, phone: string) => {
    // Fix: Using Firebase v8 auth.createUserWithEmailAndPassword and db.collection().doc().set()
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    const healthId = generateHealthId();
    const newUser: UserProfile = {
      id: cred.user!.uid,
      healthId,
      name,
      phone,
      email,
      gender: 'Other',
      age: 0,
      bloodGroup: 'N/A',
      chronicConditions: { hypertension: false, diabetes: false, asthma: false },
      emergencyContacts: [],
      activeRoles: [UserRole.PATIENT],
      suspendedRoles: [],
      appliedRoles: [],
      recordViewLimit: 10
    };
    await db.collection('users').doc(cred.user!.uid).set(newUser);
  };

  const signIn = async (email: string, pass: string) => {
    // Fix: Using Firebase v8 auth.signInWithEmailAndPassword
    await auth.signInWithEmailAndPassword(email, pass);
  };

  const signInWithGithub = async () => {
    // Fix: Using Firebase v8 auth.signInWithPopup
    const result = await auth.signInWithPopup(githubProvider);
    const user = result.user;
    
    if (user) {
      const userDocRef = db.collection('users').doc(user.uid);
      const userDoc = await userDocRef.get();
      
      if (!userDoc.exists) {
        const healthId = generateHealthId();
        const newUser: UserProfile = {
          id: user.uid,
          healthId,
          name: user.displayName || 'GitHub User',
          phone: 'N/A',
          email: user.email || '',
          gender: 'Other',
          age: 0,
          bloodGroup: 'N/A',
          chronicConditions: { hypertension: false, diabetes: false, asthma: false },
          emergencyContacts: [],
          activeRoles: [UserRole.PATIENT],
          suspendedRoles: [],
          appliedRoles: [],
          recordViewLimit: 10,
          photoUrl: user.photoURL || undefined
        };
        await userDocRef.set(newUser);
      }
    }
  };

  const logout = async () => {
    // Fix: Using Firebase v8 auth.signOut()
    await auth.signOut();
  };

  const updateUser = async (user: UserProfile) => {
    // Fix: Using Firebase v8 db.collection().doc().update()
    await db.collection('users').doc(user.id).update({ ...user });
  };

  const uploadRecord = async (title: string, dataUrl: string) => {
    if (!currentUser) return;
    // Fix: Using Firebase v8 db.collection().add()
    await db.collection('records').add({
      patientId: currentUser.id,
      title,
      fileUrl: dataUrl,
      fileType: 'image',
      uploadedAt: new Date().toISOString(),
      isHidden: false
    });
  };

  const deleteRecord = async (id: string) => {
    // Fix: Using Firebase v8 db.collection().doc().delete()
    await db.collection('records').doc(id).delete();
  };

  const addLog = async (action: string, details: string, targetId?: string, targetName?: string) => {
    if (!currentUser) return;
    // Fix: Using Firebase v8 db.collection().add()
    await db.collection('auditLogs').add({
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      details,
      targetId: targetId || null,
      targetName: targetName || null
    });
  };

  const applyForRole = async (role: UserRole, details: string, regNumber: string) => {
    if (!currentUser) return 'Not logged in';
    const updatedAppliedRoles = [...(currentUser.appliedRoles || []), { role, status: 'pending' as const, details, registrationNumber: regNumber }];
    await updateUser({ ...currentUser, appliedRoles: updatedAppliedRoles });
    return null;
  };

  const approveRole = async (userId: string, role: UserRole) => {
    // Fix: Using Firebase v8 db.collection().doc().get() and update()
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    const user = userDoc.data() as UserProfile;
    
    const activeRoles = Array.from(new Set([...user.activeRoles, role]));
    const appliedRoles = user.appliedRoles.map(a => a.role === role ? { ...a, status: 'approved' as const } : a);
    
    await db.collection('users').doc(userId).update({ activeRoles, appliedRoles });

    if (role === UserRole.ORG_OWNER) {
      await db.collection('organizations').add({
        ownerId: userId,
        name: 'New Facility',
        registrationNumber: 'DGHS-PENDING',
        location: 'TBD',
        status: 'active',
        beds: [],
        pricing: [],
        staff: [],
        ledger: [],
        reports: [],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15552000000).toISOString()
      });
    }
  };

  const suspendRole = async (userId: string, role: UserRole) => {
    // Fix: Using Firebase v8 db methods
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;
    const user = userDoc.data() as UserProfile;
    const activeRoles = user.activeRoles.filter(r => r !== role);
    const suspendedRoles = Array.from(new Set([...(user.suspendedRoles || []), role]));
    await userRef.update({ activeRoles, suspendedRoles });
    addLog('ROLE_SUSPENDED', `Suspended role ${role} for ${user.name}`, user.id, user.name);
  };

  const unsuspendRole = async (userId: string, role: UserRole) => {
    // Fix: Using Firebase v8 db methods
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;
    const user = userDoc.data() as UserProfile;
    const suspendedRoles = (user.suspendedRoles || []).filter(r => r !== role);
    const activeRoles = Array.from(new Set([...user.activeRoles, role]));
    await userRef.update({ activeRoles, suspendedRoles });
    addLog('ROLE_RESTORED', `Restored role ${role} for ${user.name}`, user.id, user.name);
  };

  const removeRole = async (userId: string, role: UserRole) => {
    // Fix: Using Firebase v8 db methods
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return;
    const user = userDoc.data() as UserProfile;
    const activeRoles = user.activeRoles.filter(r => r !== role);
    const suspendedRoles = (user.suspendedRoles || []).filter(r => r !== role);
    await userRef.update({ activeRoles, suspendedRoles });
    addLog('ROLE_REMOVED', `Removed role ${role} for ${user.name}`, user.id, user.name);
  };

  const recruitStaff = async (orgId: string, userId: string, role: UserRole) => {
    // Fix: Using Firebase v8 db methods
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (!orgDoc.exists) return;
    const org = orgDoc.data() as Organization;
    const updatedStaff = [...(org.staff || []), { userId, role, status: 'accepted' as const }];
    await orgRef.update({ staff: updatedStaff });

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const user = userDoc.data() as UserProfile;
      const activeRoles = Array.from(new Set([...user.activeRoles, role]));
      await db.collection('users').doc(userId).update({ activeRoles });
    }
  };

  const updateBedStatus = async (orgId: string, bedId: string, isOccupied: boolean, patientId?: string) => {
    // Fix: Using Firebase v8 db methods
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (!orgDoc.exists) return;
    const org = orgDoc.data() as Organization;
    const updatedBeds = (org.beds || []).map(b => b.id === bedId ? { ...b, isOccupied, currentPatientId: patientId } : b);
    await orgRef.update({ beds: updatedBeds });
  };

  const bookAppointment = async (data: { orgId: string, doctorId: string, patientId: string, date: string }) => {
    const existingCount = appointments.filter(a => a.doctorId === data.doctorId && a.date.split('T')[0] === data.date.split('T')[0]).length;
    // Fix: Using Firebase v8 db.collection().add()
    await db.collection('appointments').add({
      ...data,
      status: 'scheduled',
      serialNumber: existingCount + 1,
      createdAt: new Date().toISOString()
    });
    addLog('APPOINTMENT_BOOKED', `Booked appointment for ${data.patientId}`, data.patientId);
  };

  const completeInvestigation = async (id: string, findings: string, reportFileUrl?: string) => {
    // Fix: Using Firebase v8 db methods
    await db.collection('investigations').doc(id).update({
      status: 'Completed',
      findings,
      reportFileUrl: reportFileUrl || null,
      completedAt: new Date().toISOString()
    });
  };

  const addFinancialEntry = async (orgId: string, entry: Partial<FinancialEntry>) => {
    // Fix: Using Firebase v8 db methods
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (!orgDoc.exists) return;
    const org = orgDoc.data() as Organization;
    const newEntry: FinancialEntry = {
      id: `fin-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser?.id || 'sys',
      type: entry.type || 'credit',
      amount: entry.amount || 0,
      note: entry.note || ''
    };
    await orgRef.update({ ledger: [...(org.ledger || []), newEntry] });
  };

  const resetLedger = async (orgId: string) => {
    // Fix: Using Firebase v8 db methods
    await db.collection('organizations').doc(orgId).update({ ledger: [] });
  };

  const extendOrganizationExpiry = async (orgId: string, months: number) => {
    // Fix: Using Firebase v8 db methods
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    if (!orgDoc.exists) return;
    const org = orgDoc.data() as Organization;
    const currentExpiry = new Date(org.expiresAt);
    currentExpiry.setMonth(currentExpiry.getMonth() + months);
    await orgRef.update({ expiresAt: currentExpiry.toISOString() });
  };

  const updateOrganizationStatus = async (orgId: string, status: OrgStatus) => {
    // Fix: Using Firebase v8 db methods
    await db.collection('organizations').doc(orgId).update({ status });
  };

  const addSchedule = async (schedule: Omit<DoctorSchedule, 'id'>) => {
    // Fix: Using Firebase v8 db.collection().add()
    await db.collection('schedules').add(schedule);
  };

  const removeSchedule = async (id: string) => {
    // Fix: Using Firebase v8 db.collection().doc().delete()
    await db.collection('schedules').doc(id).delete();
  };

  const updateSchedule = async (schedule: DoctorSchedule) => {
    // Fix: Using Firebase v8 db methods
    const { id, ...rest } = schedule;
    await db.collection('schedules').doc(id).update(rest);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, organizations, auditLogs, investigations, appointments, schedules, records, isLoading, lang, t, setLang,
      signUp, signIn, signInWithGithub, logout, updateUser, uploadRecord, deleteRecord, addLog, applyForRole, approveRole,
      suspendRole, unsuspendRole, removeRole,
      recruitStaff, updateBedStatus, bookAppointment, completeInvestigation, addFinancialEntry,
      resetLedger, extendOrganizationExpiry, updateOrganizationStatus, removeSchedule, addSchedule, updateSchedule
    }}>
      {children}
    </AppContext.Provider>
  );
};
