export enum UserRole {
  PATIENT = 'Patient',
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  ORG_OWNER = 'Organization Owner',
  MANAGER = 'Manager',
  PATHOLOGIST = 'Pathologist',
  ADMIN = 'System Admin',
  ASSISTANT_MANAGER = 'Assistant Manager',
  LAB_TECHNICIAN = 'Lab Technician',
  FRONT_DESK = 'Front Desk'
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: 'image' | 'pdf';
  uploadedAt: string;
  isHidden: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  orgId?: string;
  targetId?: string;
  targetName?: string;
  details: string;
}

export interface FinancialEntry {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  note: string;
  timestamp: string;
  actorId: string;
}

export interface FinancialReport {
  id: string;
  totalCredit: number;
  totalDebit: number;
  netBalance: number;
  entries: FinancialEntry[];
  submittedAt: string;
  submittedBy: string;
}

export interface ChronicConditions {
  hypertension: boolean;
  diabetes: boolean;
  asthma: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  healthId?: string;
  photoUrl?: string;
}

export interface UserProfile {
  id: string;
  healthId: string;
  name: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  photoUrl?: string;
  email?: string;
  bloodGroup: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  allergies?: string;
  chronicConditions: ChronicConditions;
  emergencyContacts: EmergencyContact[];
  activeRoles: UserRole[];
  suspendedRoles: UserRole[];
  appliedRoles: { 
    role: UserRole; 
    status: 'pending' | 'approved'; 
    details: string; 
    registrationNumber?: string; 
  }[];
  redFlag?: { isPresent: boolean; comment: string; };
  qrCodeData?: string;
  registrationNumber?: string;
  recordViewLimit: number;
  bmdcNumber?: string;
  specialty?: string;
  degrees?: string;
  doctorNotes?: string;
}

export interface Bed {
  id: string;
  label: string;
  type: 'Ward' | 'Cabin';
  isOccupied: boolean;
  currentPatientId?: string;
}

export interface DoctorSchedule {
  id: string;
  orgId: string;
  doctorId: string;
  dayOfWeek: number; 
  startTime: string; 
  endTime: string;
  maxPatients: number;
}

export interface Appointment {
  id: string;
  orgId: string;
  doctorId: string;
  patientId: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  serialNumber?: number;
}

export type OrgStatus = 'active' | 'suspended' | 'revoked';

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  registrationNumber: string;
  location: string;
  status: OrgStatus;
  beds: Bed[];
  pricing: { id: string; investigationName: string; price: number; }[];
  staff: { userId: string; role: UserRole; status: 'pending' | 'accepted'; }[];
  ledger: FinancialEntry[];
  reports: FinancialReport[];
  createdAt: string;
  expiresAt: string; 
}

export interface Investigation {
  id: string;
  patientId: string;
  orgId: string;
  testName: string;
  status: 'Requested' | 'Completed';
  findings?: string;
  reportFileUrl?: string; 
  orderedAt: string;
  completedAt?: string;
}