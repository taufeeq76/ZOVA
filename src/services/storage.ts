import {
  Complaint,
  CurrentUser,
  ComplaintStatus,
  Role,
  Department,
  SeverityLevel,
} from '../types/index.ts';
import { processComplaintEscalation, isSameSuspect } from '../utils/escalation.ts';

import { CampusDetails, DirectoryContact, EmergencyContact } from '../types/index.ts';

const STORAGE_KEYS = {
  COMPLAINTS: 'zova_complaints_v2',
  USER: 'zova_user_v2',
  CAMPUS: 'zova_campus_v2',
  REGISTERED: 'zova_registered_v2',
  INITIALIZED: 'zova_initialized_v2',
};

export const DEFAULT_CAMPUS: CampusDetails = {
  collegeName: 'Apex Institute of Science & Technology',
  campusCode: 'AIST-BLR',
  city: 'Bangalore',
  state: 'Karnataka',
  securityHelpline: '+91 80 2839 0100',
  antiRaggingEmail: 'antiragging-cell@aist.edu.in',
  establishedYear: '1998',
};

export const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Biotechnology',
  'General Administration',
];

// Preloaded demo dataset showcasing automatic escalation
const INITIAL_DEMO_COMPLAINTS: Complaint[] = [
  // Vikram Singhania (3 complaints -> Level 3: Higher Authority)
  {
    id: 'SC-2026-0001',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2024-001',
    reporterName: 'Ananya Roy',
    raggingType: 'offline',
    category: 'Threats/Intimidation',
    incidentDate: '2026-09-28',
    incidentTime: '21:30',
    location: 'Senior Hostel Block A, 1st Floor Common Area',
    description:
      'Approached by senior student demanding personal assignment files under threat of academic boycott and intimidation.',
    severity: 'High',
    aiSummary:
      'Offline intimidation incident in Hostel Block A involving coercive demands for coursework with threats of social and academic exclusion.',
    suspect: {
      name: 'Vikram Singhania',
      department: 'Computer Science & Engineering',
      phone: '9876543210',
    },
    status: 'Under Review',
    currentEscalationLevel: 3,
    escalationHistory: [
      {
        id: 'esc-init-1',
        timestamp: '2026-09-28T22:00:00.000Z',
        level: 1,
        levelLabel: 'HOD',
        reason: 'Initial complaint assigned to HOD (Computer Science & Engineering)',
      },
      {
        id: 'esc-auto-2a',
        timestamp: '2026-10-02T16:30:00.000Z',
        level: 2,
        levelLabel: 'Dean',
        reason: 'Auto-escalated: 2nd complaint received against suspect (SC-2026-0001 elevated to Level 2)',
      },
      {
        id: 'esc-auto-3a',
        timestamp: '2026-10-07T11:15:00.000Z',
        level: 3,
        levelLabel: 'Higher Authority',
        reason: 'Auto-escalated: 3rd complaint received against suspect (SC-2026-0001 elevated to Level 3)',
      },
    ],
    privateNotes: [
      {
        id: 'note-1',
        authorRole: 'Dean',
        authorName: 'Dean of Student Welfare',
        text: 'Pattern identified across multiple hostel blocks. Coordinated with Proctorial Board.',
        timestamp: '2026-10-03T09:30:00.000Z',
      },
      {
        id: 'note-2',
        authorRole: 'Higher Authority',
        authorName: 'Anti-Ragging Committee Chair',
        text: 'Summons issued for Oct 12 tribunal hearing. Protection order active.',
        timestamp: '2026-10-07T14:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-1',
        timestamp: '2026-09-28T22:00:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed with Level 1 (HOD). Initial complaint.',
      },
      {
        id: 'aud-2',
        timestamp: '2026-10-02T16:30:00.000Z',
        actorRole: 'Higher Authority',
        actorName: 'ZOVA Auto-Escalation Engine',
        action: 'ESCALATION_LEVEL_2',
        details: 'Auto-escalated to Dean following second complaint against suspect.',
      },
      {
        id: 'aud-3',
        timestamp: '2026-10-07T11:15:00.000Z',
        actorRole: 'Higher Authority',
        actorName: 'ZOVA Auto-Escalation Engine',
        action: 'ESCALATION_LEVEL_3',
        details: 'Auto-escalated to Higher Authority following third complaint against suspect.',
      },
    ],
    createdAt: '2026-09-28T22:00:00.000Z',
    updatedAt: '2026-10-07T11:15:00.000Z',
  },
  {
    id: 'SC-2026-0002',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2024-002',
    reporterName: 'Kavita Iyer',
    raggingType: 'offline',
    category: 'Following/Stalking',
    incidentDate: '2026-10-02',
    incidentTime: '19:45',
    location: 'Central Campus Library Walkway & North Bicycle Stand',
    description:
      'Followed repeatedly after evening library hours, persistent uninvited verbal confrontations, blocking path.',
    severity: 'High',
    aiSummary:
      'Unwanted stalking and movement restriction reported near library perimeter during night hours.',
    suspect: {
      name: 'Vikram Singhania',
      department: 'Computer Science & Engineering',
      phone: '9876543210',
    },
    status: 'Action Taken',
    currentEscalationLevel: 3,
    escalationHistory: [
      {
        id: 'esc-init-2',
        timestamp: '2026-10-02T16:30:00.000Z',
        level: 2,
        levelLabel: 'Dean',
        reason: 'Auto-escalated: 2nd complaint received against suspect',
      },
      {
        id: 'esc-auto-3b',
        timestamp: '2026-10-07T11:15:00.000Z',
        level: 3,
        levelLabel: 'Higher Authority',
        reason: 'Auto-escalated: 3rd complaint received against suspect (SC-2026-0002 elevated to Level 3)',
      },
    ],
    privateNotes: [
      {
        id: 'note-3',
        authorRole: 'Dean',
        authorName: 'Dean Office',
        text: 'CCTV footage of North Stand reviewed and preserved.',
        timestamp: '2026-10-03T11:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-4',
        timestamp: '2026-10-02T16:30:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed with Level 2 (Dean) due to repeat offender match.',
      },
      {
        id: 'aud-5',
        timestamp: '2026-10-07T11:15:00.000Z',
        actorRole: 'Higher Authority',
        actorName: 'ZOVA Auto-Escalation Engine',
        action: 'ESCALATION_LEVEL_3',
        details: 'Auto-escalated to Higher Authority.',
      },
    ],
    createdAt: '2026-10-02T16:30:00.000Z',
    updatedAt: '2026-10-07T11:15:00.000Z',
  },
  {
    id: 'SC-2026-0003',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2024-003',
    reporterName: 'Dev Patel',
    raggingType: 'online',
    category: 'Online threats',
    incidentDate: '2026-10-07',
    incidentTime: '10:00',
    location: 'Official Batch Telegram Group & Discord Server',
    description:
      'Coordinated abusive messages, explicit threats of physical assault if past complaints were not withdrawn immediately.',
    severity: 'Critical',
    aiSummary:
      'Urgent online retaliation threat issued on messaging channels targeting students regarding previous safety complaints.',
    suspect: {
      name: 'Vikram Singhania',
      department: 'Computer Science & Engineering',
      phone: '9876543210',
    },
    status: 'Action Taken',
    currentEscalationLevel: 3,
    escalationHistory: [
      {
        id: 'esc-init-3',
        timestamp: '2026-10-07T11:15:00.000Z',
        level: 3,
        levelLabel: 'Higher Authority',
        reason: 'Auto-escalated: 3rd complaint received against suspect',
      },
    ],
    privateNotes: [
      {
        id: 'note-4',
        authorRole: 'Higher Authority',
        authorName: 'Provost / Higher Authority',
        text: 'Direct retaliation detected. Immediate suspension from campus hostel and laboratory access ordered pending committee verdict.',
        timestamp: '2026-10-07T13:30:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-6',
        timestamp: '2026-10-07T11:15:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed with Level 3 (Higher Authority). 3rd complaint threshold reached.',
      },
      {
        id: 'aud-7',
        timestamp: '2026-10-07T13:30:00.000Z',
        actorRole: 'Higher Authority',
        actorName: 'Anti-Ragging Committee Chair',
        action: 'STATUS_UPDATED',
        details: 'Status changed to Action Taken. Restraining directive enforced.',
      },
    ],
    createdAt: '2026-10-07T11:15:00.000Z',
    updatedAt: '2026-10-07T13:30:00.000Z',
  },

  // Aryan Mehra (2 complaints -> Level 2: Dean)
  {
    id: 'SC-2026-0004',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2024-004',
    reporterName: 'Meera Sen',
    raggingType: 'offline',
    category: 'Unwanted behaviour',
    incidentDate: '2026-10-04',
    incidentTime: '15:15',
    location: 'Mechanical Engineering Workshop B - CAD Lab',
    description:
      'Deliberate tampering with project equipment and forceful humiliation in front of peer group during practical session.',
    severity: 'Medium',
    aiSummary:
      'Workplace harassment and interference with academic laboratory equipment in mechanical department workshop.',
    suspect: {
      name: 'Aryan Mehra',
      department: 'Mechanical Engineering',
      phone: '9812345678',
    },
    status: 'Under Review',
    currentEscalationLevel: 2,
    escalationHistory: [
      {
        id: 'esc-init-4',
        timestamp: '2026-10-04T16:00:00.000Z',
        level: 1,
        levelLabel: 'HOD',
        reason: 'Initial complaint assigned to HOD (Mechanical Engineering)',
      },
      {
        id: 'esc-auto-2b',
        timestamp: '2026-10-08T09:30:00.000Z',
        level: 2,
        levelLabel: 'Dean',
        reason: 'Auto-escalated: 2nd complaint received against suspect (SC-2026-0004 elevated to Level 2)',
      },
    ],
    privateNotes: [
      {
        id: 'note-5',
        authorRole: 'HOD',
        authorName: 'HOD Mechanical',
        text: 'Lab instructor confirmed equipment malfunction was caused intentionally.',
        timestamp: '2026-10-05T10:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-8',
        timestamp: '2026-10-04T16:00:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed with Level 1 (HOD).',
      },
      {
        id: 'aud-9',
        timestamp: '2026-10-08T09:30:00.000Z',
        actorRole: 'Higher Authority',
        actorName: 'ZOVA Auto-Escalation Engine',
        action: 'ESCALATION_LEVEL_2',
        details: 'Auto-escalated to Dean following 2nd complaint.',
      },
    ],
    createdAt: '2026-10-04T16:00:00.000Z',
    updatedAt: '2026-10-08T09:30:00.000Z',
  },
  {
    id: 'SC-2026-0005',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2024-005',
    reporterName: 'Sanjay Nair',
    raggingType: 'online',
    category: 'Fake accounts',
    incidentDate: '2026-10-08',
    incidentTime: '08:45',
    location: 'Instagram Page @campus_confessions_unofficial',
    description:
      'Anonymous account using altered student photos with defamatory captions targeting junior students.',
    severity: 'Medium',
    aiSummary:
      'Online cyber defamation via anonymous Instagram page distributing altered student imagery without consent.',
    suspect: {
      name: 'Aryan Mehra',
      department: 'Mechanical Engineering',
      phone: '9812345678',
    },
    status: 'Submitted',
    currentEscalationLevel: 2,
    escalationHistory: [
      {
        id: 'esc-init-5',
        timestamp: '2026-10-08T09:30:00.000Z',
        level: 2,
        levelLabel: 'Dean',
        reason: 'Auto-escalated: 2nd complaint received against suspect',
      },
    ],
    privateNotes: [],
    auditLogs: [
      {
        id: 'aud-10',
        timestamp: '2026-10-08T09:30:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed with Level 2 (Dean) automatically.',
      },
    ],
    createdAt: '2026-10-08T09:30:00.000Z',
    updatedAt: '2026-10-08T09:30:00.000Z',
  },

  // Rohan Das (1 complaint -> Level 1: HOD)
  {
    id: 'SC-2026-0006',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2024-001',
    reporterName: 'Ananya Roy',
    raggingType: 'offline',
    category: 'Following/Stalking',
    incidentDate: '2026-10-06',
    incidentTime: '17:00',
    location: 'ECE Department Corridor 2nd Floor',
    description:
      'Senior student blocking entrance, making unwelcome personal remarks and insisting on exchange of phone numbers.',
    severity: 'Low',
    aiSummary:
      'Department corridor stalking and unwanted boundary violations reported during class change hours.',
    suspect: {
      name: 'Rohan Das',
      department: 'Electronics & Communication',
      phone: '9823456789',
    },
    status: 'Submitted',
    currentEscalationLevel: 1,
    escalationHistory: [
      {
        id: 'esc-init-6',
        timestamp: '2026-10-06T18:00:00.000Z',
        level: 1,
        levelLabel: 'HOD',
        reason: 'Initial complaint assigned to HOD (Electronics & Communication)',
      },
    ],
    privateNotes: [],
    auditLogs: [
      {
        id: 'aud-11',
        timestamp: '2026-10-06T18:00:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed with Level 1 (HOD).',
      },
    ],
    createdAt: '2026-10-06T18:00:00.000Z',
    updatedAt: '2026-10-06T18:00:00.000Z',
  },
];

class StorageService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (typeof window === 'undefined') return;
    const exists = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (!exists) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_DEMO_COMPLAINTS));
    }
  }

  public resetToDemoData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(INITIAL_DEMO_COMPLAINTS));
  }

  public getComplaints(): Complaint[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveComplaints(complaints: Complaint[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }

  public getComplaintById(id: string): Complaint | undefined {
    const list = this.getComplaints();
    const cleanId = id.trim().toUpperCase();
    return list.find((c) => c.id.toUpperCase() === cleanId);
  }

  public getComplaintsForStudent(studentId: string): Complaint[] {
    const list = this.getComplaints();
    return list.filter((c) => c.reporterStudentId === studentId);
  }

  public countComplaintsForSuspect(suspect: { name: string; department: string; phone: string }): number {
    const list = this.getComplaints();
    return list.filter((c) => isSameSuspect(c.suspect, suspect as any)).length;
  }

  /**
   * Submits a new complaint, applies automatic escalation across all related complaints,
   * saves to localStorage, and returns the newly saved complaint.
   */
  public submitComplaint(
    complaintData: Omit<
      Complaint,
      'id' | 'createdAt' | 'updatedAt' | 'escalationHistory' | 'auditLogs' | 'privateNotes' | 'status' | 'currentEscalationLevel'
    >
  ): { complaint: Complaint; totalComplaintsForSuspect: number } {
    const existing = this.getComplaints();

    // Generate unique Report ID e.g. SC-2026-0007
    const year = new Date().getFullYear();
    const nextNum = existing.length + 1;
    const padded = nextNum.toString().padStart(4, '0');
    const id = `SC-${year}-${padded}`;

    const now = new Date().toISOString();

    const rawComplaint: Complaint = {
      ...complaintData,
      id,
      status: 'Submitted',
      currentEscalationLevel: 1, // temporary, will be assigned by pure function
      escalationHistory: [],
      privateNotes: [],
      auditLogs: [],
      createdAt: now,
      updatedAt: now,
    };

    // Run pure automatic escalation function
    const { updatedComplaints, totalComplaintsForSuspect } = processComplaintEscalation(
      existing,
      rawComplaint
    );

    this.saveComplaints(updatedComplaints);

    const saved = updatedComplaints.find((c) => c.id === id)!;
    return { complaint: saved, totalComplaintsForSuspect };
  }

  public updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    noteText: string,
    actorRole: Role,
    actorName: string
  ): Complaint | null {
    const list = this.getComplaints();
    const item = list.find((c) => c.id === id);
    if (!item) return null;

    const now = new Date().toISOString();
    const oldStatus = item.status;
    item.status = status;
    item.updatedAt = now;

    if (noteText.trim()) {
      item.privateNotes.push({
        id: `note-${Date.now()}`,
        authorRole: actorRole,
        authorName: actorName,
        text: noteText.trim(),
        timestamp: now,
      });
    }

    item.auditLogs.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      actorRole,
      actorName,
      action: 'STATUS_UPDATED',
      details: `Status changed from "${oldStatus}" to "${status}". ${noteText.trim() ? `Note added: "${noteText.trim()}"` : ''}`,
    });

    this.saveComplaints(list);
    return item;
  }

  public addPrivateNote(
    id: string,
    text: string,
    authorRole: Role,
    authorName: string
  ): Complaint | null {
    const list = this.getComplaints();
    const item = list.find((c) => c.id === id);
    if (!item) return null;

    const now = new Date().toISOString();
    item.privateNotes.push({
      id: `note-${Date.now()}`,
      authorRole,
      authorName,
      text: text.trim(),
      timestamp: now,
    });

    item.auditLogs.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      actorRole: authorRole,
      actorName: authorName,
      action: 'NOTE_ADDED',
      details: `Confidential note added by ${authorRole} (${authorName}).`,
    });

    this.saveComplaints(list);
    return item;
  }

  // Campus details
  public getCampusDetails(): CampusDetails {
    if (typeof window === 'undefined') return DEFAULT_CAMPUS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAMPUS);
      if (data) return JSON.parse(data);
    } catch {}
    this.saveCampusDetails(DEFAULT_CAMPUS);
    return DEFAULT_CAMPUS;
  }

  public saveCampusDetails(campus: CampusDetails): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CAMPUS, JSON.stringify(campus));
  }

  // Registration state
  public hasRegistered(): boolean {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEYS.REGISTERED) === 'true';
  }

  public setRegistered(status: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.REGISTERED, status ? 'true' : 'false');
  }

  // Current logged in demo / registered user
  public getCurrentUser(): CurrentUser {
    const campus = this.getCampusDetails();
    if (typeof window === 'undefined') {
      return {
        role: 'Student',
        name: 'Ananya Roy',
        studentId: 'STU-2024-001',
        email: 'ananya.roy@student.aist.edu.in',
        campus,
        isVerified: true,
        verificationMethod: 'student_portal',
      };
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.campus) parsed.campus = campus;
        if (parsed.isVerified === undefined) parsed.isVerified = true;
        return parsed;
      }
    } catch {}

    // Default demo user: Student
    const def: CurrentUser = {
      role: 'Student',
      name: 'Ananya Roy',
      studentId: 'STU-2024-001',
      email: 'ananya.roy@student.aist.edu.in',
      campus,
      isVerified: true,
      verificationMethod: 'student_portal',
    };
    this.setCurrentUser(def);
    return def;
  }

  public setCurrentUser(user: CurrentUser): void {
    if (typeof window === 'undefined') return;
    if (!user.campus) user.campus = this.getCampusDetails();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Institutional passkeys verification helper
  public verifyRolePasskey(passkey: string, role: Role): { success: boolean; message: string } {
    const clean = passkey.trim();
    const VALID_KEYS: Record<string, Role[]> = {
      'ZOVA-DEAN-SECURE': ['Dean'],
      'ZOVA-HOD-AUTH': ['HOD'],
      'ZOVA-AUTHORITY-ROOT': ['Higher Authority'],
      'ZOVA-FACULTY-2026': ['Faculty'],
      'ZOVA-CAMPUS-ADMIN': ['Dean', 'HOD', 'Higher Authority', 'Faculty', 'Other'],
    };

    const allowedRoles = VALID_KEYS[clean];
    if (allowedRoles && allowedRoles.includes(role)) {
      return { success: true, message: `Passkey accepted! Role verified as ${role}.` };
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      return {
        success: false,
        message: `This passkey is for ${allowedRoles.join('/')}, but your selected role is ${role}.`,
      };
    }
    return {
      success: false,
      message: 'Invalid institutional passkey. Contact your campus administrator.',
    };
  }
}

export const storage = new StorageService();
