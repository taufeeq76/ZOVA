export type Role = 'Student' | 'HOD' | 'Dean' | 'Higher Authority';

export type Department =
  | 'Computer Science & Engineering'
  | 'Mechanical Engineering'
  | 'Electronics & Communication';

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
}

export interface CurrentUser {
  role: Role;
  name: string;
  studentId?: string;
  department?: Department; // for HOD
}
