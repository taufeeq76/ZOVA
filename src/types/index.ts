export type Role =
  | 'Student'
  | 'Faculty'
  | 'HOD'
  | 'Dean'
  | 'Higher Authority'
  | 'Other';

export type Department =
  | 'Computer Science & Engineering'
  | 'Mechanical Engineering'
  | 'Electronics & Communication'
  | 'Information Technology'
  | 'Biotechnology'
  | 'General Administration';

export type RaggingType = 'offline' | 'online';

export type OfflineCategory =
  | 'Stalking'
  | 'Unwanted behaviour'
  | 'Threats'
  | 'Other'
  | 'Following/Stalking'
  | 'Threats/Intimidation';

export type OnlineCategory =
  | 'Fake accounts'
  | 'Obscene content'
  | 'Online threats'
  | 'Other';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Action Taken'
  | 'Closed';

export type EscalationLevel = 1 | 2 | 3; // 1 = HOD, 2 = Dean, 3 = Higher Authority

export interface EscalationHistoryItem {
  id: string;
  timestamp: string;
  level: EscalationLevel;
  reason: string;
  levelLabel: 'HOD' | 'Dean' | 'Higher Authority';
}

export interface Suspect {
  name: string;
  department: Department;
  phone: string; // validated digits
}

export interface EvidenceFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // base64 preview
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: Role;
  actorName: string;
  action: string;
  details: string;
}

export interface Complaint {
  id: string; // e.g. "SC-2026-0001"
  reporterRole: 'Student';
  reporterStudentId: string; // stored for student's "My Reports", but NEVER revealed to authorities
  reporterName: string; // NEVER shown to authorities
  raggingType: RaggingType;
  category: OfflineCategory | OnlineCategory;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  aiEnhancedDescription?: string;
  severity: SeverityLevel;
  aiSummary?: string;
  evidence?: EvidenceFile;
  suspect: Suspect;
  status: ComplaintStatus;
  currentEscalationLevel: EscalationLevel; // 1 (HOD), 2 (Dean), 3 (Higher Authority)
  escalationHistory: EscalationHistoryItem[];
  privateNotes: Array<{
    id: string;
    authorRole: Role;
    authorName: string;
    text: string;
    timestamp: string;
  }>;
  auditLogs: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
  campusCode?: string;
}

export interface CampusDetails {
  collegeName: string;
  campusCode: string;
  city: string;
  state: string;
  securityHelpline: string;
  antiRaggingEmail: string;
  establishedYear?: string;
}

export interface CurrentUser {
  id?: string;
  role: Role;
  customRoleTitle?: string; // used when role is 'Other', e.g. 'Campus Counsellor', 'Hostel Warden'
  name: string;
  email?: string;
  phone?: string;
  studentId?: string;
  employeeId?: string;
  department?: Department; // for HOD / Faculty
  campus: CampusDetails;
  isVerified: boolean; // whether administrative/officer role is verified
  verificationMethod?: 'institutional_passkey' | 'student_portal' | 'unverified_pending';
  authToken?: string;
}

export interface DirectoryContact {
  id: string;
  name: string;
  designation: string;
  roleType: 'Dean' | 'HOD' | 'Faculty' | 'Counsellor' | 'Security' | 'Warden' | 'Staff';
  department: string;
  phone: string;
  email: string;
  officeRoom: string;
  isAvailable: boolean;
  verifiedCampusBadge: boolean;
  campusCode: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  category:
    | 'Campus Security'
    | 'Police & Emergency'
    | 'Anti-Ragging Helpline'
    | 'Cyber Crime'
    | 'Medical & Trauma'
    | 'Women Safety'
    | 'Counselling';
  phone: string;
  email?: string;
  hours: string;
  description: string;
  isVerified: boolean;
  isTollFree: boolean;
  campusSpecific?: boolean;
  campusCode?: string;
  recommendedFor?: string[]; // e.g. ['offline', 'Threats/Intimidation', 'online', 'Fake accounts']
}

export interface College {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  securityHelpline: string;
  antiRaggingEmail: string;
}

// ==========================================
// EMERGENCY CAMPUS SOS TYPES
// ==========================================

export type SOSIncidentStatus =
  | 'Triggered'
  | 'Pending delivery'
  | 'Delivered'
  | 'Acknowledged'
  | 'Response in progress'
  | 'Resolved'
  | 'Cancelled'
  | 'Escalated'
  | 'Delivery failed';

export interface SOSLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: string;
  campusZone?: string; // e.g. "Library Quad", "Hostel Block A", "Main Gate"
  addressHint?: string;
}

export interface SOSDispatchNote {
  id: string;
  authorRole: Role;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface SOSAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorRole: string;
  actorName: string;
  details: string;
}

export interface SOSIncident {
  id: string; // e.g. "SOS-2026-9021"
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentDepartment?: Department;
  campusCode: string;
  campusName: string;
  status: SOSIncidentStatus;
  location: SOSLocation | null;
  locationHistory: SOSLocation[];
  locationError?: string;
  triggerMode: 'hold_press' | 'instant_tap' | 'discreet_stealth' | 'widget_shortcut';
  triggeredAt: string;
  deliveredAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: {
    name: string;
    role: Role;
  };
  responseStartedAt?: string;
  resolvedAt?: string;
  resolvedBy?: {
    name: string;
    role: Role;
    resolutionNote?: string;
  };
  cancelledAt?: string;
  cancelledBy?: 'Student' | 'Authority';
  cancellationReason?: string;
  escalatedAt?: string;
  escalatedReason?: string;
  dispatchNotes: SOSDispatchNote[];
  auditLogs: SOSAuditLog[];
  updatedAt: string;
}

export interface SOSWidgetPreferences {
  activationGesture: 'hold_to_activate' | 'instant_countdown' | 'double_tap';
  holdDurationSeconds: number; // default 2
  countdownGracePeriodSeconds: number; // default 5
  enableHaptics: boolean;
  enableAudioFeedback: boolean;
  stealthDisguiseMode: boolean; // default false, user can toggle
  autoShareLocation: boolean;
  preferredEmergencyContactId?: string;
}
