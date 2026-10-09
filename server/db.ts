import {
  Complaint,
  DirectoryContact,
  EmergencyContact,
  College,
  CampusDetails,
  CurrentUser,
  Role,
  ComplaintStatus,
  SOSIncident,
  SOSIncidentStatus,
  SOSLocation,
  SOSDispatchNote,
  SOSAuditLog,
} from '../src/types/index.ts';

// Predefined verified institutional passkeys for testing and campus administration
export const INSTITUTIONAL_PASSKEYS: Record<string, { role: Role; label: string }> = {
  'ZOVA-DEAN-SECURE': { role: 'Dean', label: 'Dean of Student Affairs / Administration' },
  'ZOVA-HOD-AUTH': { role: 'HOD', label: 'Department Head Authorization Key' },
  'ZOVA-AUTHORITY-ROOT': { role: 'Higher Authority', label: 'Anti-Ragging Committee / Ombudsman' },
  'ZOVA-FACULTY-2026': { role: 'Faculty', label: 'Verified Campus Faculty Staff' },
  'ZOVA-CAMPUS-ADMIN': { role: 'Higher Authority', label: 'Master Campus Security Administrator' },
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

export const DEFAULT_COLLEGES: College[] = [
  {
    id: 'col-1',
    name: 'Apex Institute of Science & Technology',
    code: 'AIST-BLR',
    city: 'Bangalore',
    state: 'Karnataka',
    securityHelpline: '+91 80 2839 0100',
    antiRaggingEmail: 'antiragging-cell@aist.edu.in',
  },
  {
    id: 'col-2',
    name: 'National Institute of Technology & Research',
    code: 'NITR-DEL',
    city: 'New Delhi',
    state: 'Delhi NCR',
    securityHelpline: '+91 11 2690 7400',
    antiRaggingEmail: 'safety.oversight@nitr.ac.in',
  },
  {
    id: 'col-3',
    name: 'St. Xavier Technical Campus',
    code: 'SXTC-MUM',
    city: 'Mumbai',
    state: 'Maharashtra',
    securityHelpline: '+91 22 2262 0661',
    antiRaggingEmail: 'studentwelfare@sxtc.edu',
  },
];

export const DEFAULT_DIRECTORY: DirectoryContact[] = [
  {
    id: 'dir-1',
    name: 'Dr. Robert Sterling',
    designation: 'Dean of Student Welfare & Proctor',
    roleType: 'Dean',
    department: 'Student Affairs',
    phone: '+91 80 2839 0110',
    email: 'dean.welfare@aist.edu.in',
    officeRoom: 'Admin Block, Room 204',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-2',
    name: 'Dr. K. Sharma',
    designation: 'Head of Department (Computer Science)',
    roleType: 'HOD',
    department: 'Computer Science & Engineering',
    phone: '+91 80 2839 0120',
    email: 'hod.cse@aist.edu.in',
    officeRoom: 'CS Wing, Room 301',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-3',
    name: 'Dr. V. Prasad',
    designation: 'Head of Department (Mechanical)',
    roleType: 'HOD',
    department: 'Mechanical Engineering',
    phone: '+91 80 2839 0130',
    email: 'hod.mech@aist.edu.in',
    officeRoom: 'Tech Block 2, Room 105',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-4',
    name: 'Dr. S. Rao',
    designation: 'Head of Department (ECE)',
    roleType: 'HOD',
    department: 'Electronics & Communication',
    phone: '+91 80 2839 0140',
    email: 'hod.ece@aist.edu.in',
    officeRoom: 'ECE Tower, Room 410',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-5',
    name: 'Prof. Elena Vance',
    designation: 'Associate Professor & Student Mentor',
    roleType: 'Faculty',
    department: 'Computer Science & Engineering',
    phone: '+91 80 2839 0125',
    email: 'elena.vance@aist.edu.in',
    officeRoom: 'CS Wing, Room 208',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-6',
    name: 'Dr. Priya Nair',
    designation: 'Campus Clinical Psychologist & Counsellor',
    roleType: 'Counsellor',
    department: 'Health & Counselling',
    phone: '+91 80 2839 0199',
    email: 'counselling.care@aist.edu.in',
    officeRoom: 'Wellness Center, Room 102',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-7',
    name: 'Col. Rajesh Malhotra (Retd.)',
    designation: 'Chief Campus Security Officer',
    roleType: 'Security',
    department: 'Campus Security',
    phone: '+91 80 2839 0100',
    email: 'chief.security@aist.edu.in',
    officeRoom: 'Main Gate Control Tower',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
  {
    id: 'dir-8',
    name: 'Mr. Devendra Verma',
    designation: 'Senior Hostel Warden (Blocks A & B)',
    roleType: 'Warden',
    department: 'General Administration',
    phone: '+91 80 2839 0180',
    email: 'warden.hostels@aist.edu.in',
    officeRoom: 'Hostel Complex Office, Ground Floor',
    isAvailable: true,
    verifiedCampusBadge: true,
    campusCode: 'AIST-BLR',
  },
];

export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'em-1',
    name: 'Campus 24/7 Security Dispatch',
    category: 'Campus Security',
    phone: '+91 80 2839 0100',
    hours: '24/7 Monitored (< 3 min response)',
    description: 'Instant campus quick-reaction patrol and hostel security response team.',
    isVerified: true,
    isTollFree: false,
    campusSpecific: true,
    campusCode: 'AIST-BLR',
    recommendedFor: ['all', 'offline', 'Threats/Intimidation', 'Stalking'],
  },
  {
    id: 'em-2',
    name: 'National Anti-Ragging Helpline (UGC)',
    category: 'Anti-Ragging Helpline',
    phone: '18001805522',
    email: 'helpline@antiragging.in',
    hours: '24 Hours Toll-Free',
    description: 'Statutory national anti-ragging support. Direct FIR referral and university compliance tracking.',
    isVerified: true,
    isTollFree: true,
    recommendedFor: ['all', 'offline', 'online', 'Threats/Intimidation', 'Unwanted behaviour'],
  },
  {
    id: 'em-3',
    name: 'National Cyber Crime Reporting Helpline',
    category: 'Cyber Crime',
    phone: '1930',
    email: 'report@cybercrime.gov.in',
    hours: '24 Hours Toll-Free',
    description: 'Immediate action on online harassment, blackmail, non-consensual media, and impersonation.',
    isVerified: true,
    isTollFree: true,
    recommendedFor: ['online', 'Fake accounts', 'Obscene content', 'Online threats'],
  },
  {
    id: 'em-4',
    name: 'National Emergency Response (Police / Fire / Ambulance)',
    category: 'Police & Emergency',
    phone: '112',
    hours: 'Immediate 24/7 Dispatch',
    description: 'Unified national emergency response support system for imminent physical danger.',
    isVerified: true,
    isTollFree: true,
    recommendedFor: ['all', 'offline', 'Threats', 'Critical'],
  },
  {
    id: 'em-5',
    name: 'Campus Health & Emergency Trauma Ward',
    category: 'Medical & Trauma',
    phone: '+91 80 2839 0108',
    hours: '24/7 On-duty Doctor & Ambulance',
    description: 'On-campus medical emergency room, trauma assistance, and rapid ambulance service.',
    isVerified: true,
    isTollFree: false,
    campusSpecific: true,
    campusCode: 'AIST-BLR',
    recommendedFor: ['offline', 'Threats', 'Critical'],
  },
  {
    id: 'em-6',
    name: 'National Women Safety Helpline (NCW)',
    category: 'Women Safety',
    phone: '7827170170',
    email: 'complaintcell-ncw@nic.in',
    hours: '24/7 Dedicated Cell',
    description: 'Confidential support, legal aid, and security intervention for female students.',
    isVerified: true,
    isTollFree: false,
    recommendedFor: ['offline', 'online', 'Stalking', 'Following/Stalking', 'Obscene content'],
  },
  {
    id: 'em-7',
    name: 'Tele-MANAS Student Mental Health Helpline',
    category: 'Counselling',
    phone: '14416',
    hours: '24/7 Toll-Free Psychological Support',
    description: 'Free, confidential psychological counselling and emotional distress management.',
    isVerified: true,
    isTollFree: true,
    recommendedFor: ['all', 'offline', 'online'],
  },
  {
    id: 'em-8',
    name: 'Campus Internal Complaints Committee (ICC)',
    category: 'Anti-Ragging Helpline',
    phone: '+91 80 2839 0195',
    email: 'icc@aist.edu.in',
    hours: 'Mon-Sat 08:30 - 18:00',
    description: 'Mandatory statutory committee for grievance redressing and student safety.',
    isVerified: true,
    isTollFree: false,
    campusSpecific: true,
    campusCode: 'AIST-BLR',
    recommendedFor: ['all', 'offline', 'online', 'Unwanted behaviour'],
  },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
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
        authorName: 'Dean Robert Sterling',
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
        action: 'AUTO_ESCALATED',
        details: 'Auto-escalated from Level 1 to Level 2 (2nd report against suspect).',
      },
      {
        id: 'aud-3',
        timestamp: '2026-10-07T11:15:00.000Z',
        actorRole: 'Higher Authority',
        actorName: 'ZOVA Auto-Escalation Engine',
        action: 'AUTO_ESCALATED',
        details: 'Auto-escalated from Level 2 to Level 3 (3rd report against suspect).',
      },
    ],
    createdAt: '2026-09-28T22:00:00.000Z',
    updatedAt: '2026-10-07T14:00:00.000Z',
    campusCode: 'AIST-BLR',
  },
  {
    id: 'SC-2026-0002',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2025-014',
    reporterName: 'Kavita Menon',
    raggingType: 'offline',
    category: 'Unwanted behaviour',
    incidentDate: '2026-10-02',
    incidentTime: '15:45',
    location: 'Cafeteria Courtyard, Near Block B',
    description:
      'Targeted for unwanted chore requests and aggressive public verbal harassment by senior student.',
    severity: 'Medium',
    aiSummary:
      'Public verbal harassment and forced task imposition in the cafeteria courtyard.',
    suspect: {
      name: 'Vikram Singhania',
      department: 'Computer Science & Engineering',
      phone: '9876543210',
    },
    status: 'Under Review',
    currentEscalationLevel: 3,
    escalationHistory: [
      {
        id: 'esc-init-2',
        timestamp: '2026-10-02T16:30:00.000Z',
        level: 2,
        levelLabel: 'Dean',
        reason: 'Auto-escalated to Level 2 upon submission: 2nd complaint against Vikram Singhania',
      },
      {
        id: 'esc-auto-3b',
        timestamp: '2026-10-07T11:15:00.000Z',
        level: 3,
        levelLabel: 'Higher Authority',
        reason: 'Auto-escalated to Level 3: 3rd complaint against suspect received',
      },
    ],
    privateNotes: [
      {
        id: 'note-3',
        authorRole: 'Dean',
        authorName: 'Dean Robert Sterling',
        text: 'Eyewitness accounts collected from Cafeteria CCTV.',
        timestamp: '2026-10-04T11:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-4',
        timestamp: '2026-10-02T16:30:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed. Repeat offender identified (Count: 2). Auto-escalated to Level 2.',
      },
    ],
    createdAt: '2026-10-02T16:30:00.000Z',
    updatedAt: '2026-10-07T11:15:00.000Z',
    campusCode: 'AIST-BLR',
  },
  {
    id: 'SC-2026-0003',
    reporterRole: 'Student',
    reporterStudentId: 'STU-2025-089',
    reporterName: 'Rahul Verma',
    raggingType: 'offline',
    category: 'Threats/Intimidation',
    incidentDate: '2026-10-07',
    incidentTime: '10:00',
    location: 'Central Library Basement Parking',
    description:
      'Surrounded near two-wheeler parking lot and threatened with physical repercussions if previous grievances were not withdrawn.',
    severity: 'High',
    aiSummary:
      'Coercive intimidation and physical menace in library parking to suppress grievance filing.',
    suspect: {
      name: 'Vikram Singhania',
      department: 'Computer Science & Engineering',
      phone: '9876543210',
    },
    status: 'Under Review',
    currentEscalationLevel: 3,
    escalationHistory: [
      {
        id: 'esc-init-3',
        timestamp: '2026-10-07T11:15:00.000Z',
        level: 3,
        levelLabel: 'Higher Authority',
        reason: 'Direct Level 3 auto-escalation: 3rd complaint against suspect Vikram Singhania',
      },
    ],
    privateNotes: [
      {
        id: 'note-4',
        authorRole: 'Higher Authority',
        authorName: 'Anti-Ragging Committee Chair',
        text: 'Immediate interim suspension recommended. Security alerted at campus gates.',
        timestamp: '2026-10-07T12:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'aud-5',
        timestamp: '2026-10-07T11:15:00.000Z',
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: 'Report filed. Repeat offender critical threshold reached (Count: 3). Escalated to Level 3.',
      },
    ],
    createdAt: '2026-10-07T11:15:00.000Z',
    updatedAt: '2026-10-07T12:00:00.000Z',
    campusCode: 'AIST-BLR',
  },
];

class ServerDatabase {
  private complaints: Complaint[] = [...INITIAL_COMPLAINTS];
  private directory: DirectoryContact[] = [...DEFAULT_DIRECTORY];
  private emergencyContacts: EmergencyContact[] = [...DEFAULT_EMERGENCY_CONTACTS];
  private colleges: College[] = [...DEFAULT_COLLEGES];
  private registeredUsers: Map<string, CurrentUser> = new Map();
  private sosIncidents: SOSIncident[] = [
    {
      id: 'SOS-2026-8921',
      studentId: 'STU-2024-001',
      studentName: 'Ananya Roy',
      studentPhone: '+91 98765 11223',
      studentDepartment: 'Computer Science & Engineering',
      campusCode: 'AIST-BLR',
      campusName: 'Apex Institute of Science & Technology',
      status: 'Response in progress',
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 5.4,
        timestamp: new Date(Date.now() - 150000).toISOString(),
        campusZone: 'Hostel Block A - Courtyard',
        addressHint: 'Between Senior Hostel and Dining Hall Gate',
      },
      locationHistory: [
        {
          latitude: 12.9712,
          longitude: 77.5942,
          accuracy: 8.2,
          timestamp: new Date(Date.now() - 210000).toISOString(),
          campusZone: 'Hostel Block A - Walkway',
        },
        {
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 5.4,
          timestamp: new Date(Date.now() - 150000).toISOString(),
          campusZone: 'Hostel Block A - Courtyard',
          addressHint: 'Between Senior Hostel and Dining Hall Gate',
        },
      ],
      triggerMode: 'hold_press',
      triggeredAt: new Date(Date.now() - 210000).toISOString(),
      deliveredAt: new Date(Date.now() - 208000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 180000).toISOString(),
      acknowledgedBy: {
        name: 'Dean Robert Sterling',
        role: 'Dean',
      },
      responseStartedAt: new Date(Date.now() - 150000).toISOString(),
      dispatchNotes: [
        {
          id: 'disp-sos-1',
          authorRole: 'Dean',
          authorName: 'Dean Robert Sterling',
          text: 'Verified SOS alert received. Quick Response Team dispatched to Hostel Block A.',
          timestamp: new Date(Date.now() - 175000).toISOString(),
        },
        {
          id: 'disp-sos-2',
          authorRole: 'Higher Authority',
          authorName: 'CSO R. Mehta (Security)',
          text: 'Security Patrol Car 2 positioned at Courtyard entrance. Contact established with hostel warden.',
          timestamp: new Date(Date.now() - 120000).toISOString(),
        },
      ],
      auditLogs: [
        {
          id: 'aud-sos-1',
          timestamp: new Date(Date.now() - 210000).toISOString(),
          action: 'SOS_TRIGGERED',
          actorRole: 'Student',
          actorName: 'Ananya Roy',
          details: 'Emergency SOS activated via Press-and-Hold gesture. Location acquired with 8.2m accuracy.',
        },
        {
          id: 'aud-sos-2',
          timestamp: new Date(Date.now() - 208000).toISOString(),
          action: 'DELIVERED',
          actorRole: 'System',
          actorName: 'ZOVA High-Priority Gateway',
          details: 'Alert delivered to campus proctor, security control room, and dean console.',
        },
        {
          id: 'aud-sos-3',
          timestamp: new Date(Date.now() - 180000).toISOString(),
          action: 'ACKNOWLEDGED',
          actorRole: 'Dean',
          actorName: 'Dean Robert Sterling',
          details: 'Emergency acknowledged. First responder team dispatched.',
        },
        {
          id: 'aud-sos-4',
          timestamp: new Date(Date.now() - 150000).toISOString(),
          action: 'RESPONSE_IN_PROGRESS',
          actorRole: 'Higher Authority',
          actorName: 'Campus Security Control',
          details: 'Physical security presence dispatched to coordinates.',
        },
      ],
      updatedAt: new Date(Date.now() - 120000).toISOString(),
    },
  ];

  constructor() {
    // Seed default demo user
    this.registeredUsers.set('STU-2024-001', {
      id: 'usr-1',
      role: 'Student',
      name: 'Ananya Roy',
      email: 'ananya.roy@student.aist.edu.in',
      phone: '+91 98765 11223',
      studentId: 'STU-2024-001',
      campus: DEFAULT_CAMPUS,
      isVerified: true,
      verificationMethod: 'student_portal',
      authToken: 'token_stu_2024_001',
    });
  }

  // --- Directory Operations ---
  public getDirectory(campusCode?: string): DirectoryContact[] {
    if (!campusCode) return this.directory;
    return this.directory.filter((d) => !d.campusCode || d.campusCode === campusCode);
  }

  public addDirectoryContact(contact: Omit<DirectoryContact, 'id'>): DirectoryContact {
    const newContact: DirectoryContact = {
      ...contact,
      id: `dir-${Date.now()}`,
    };
    this.directory.push(newContact);
    return newContact;
  }

  public updateDirectoryContact(id: string, updates: Partial<DirectoryContact>): DirectoryContact | null {
    const index = this.directory.findIndex((d) => d.id === id);
    if (index === -1) return null;
    this.directory[index] = { ...this.directory[index], ...updates };
    return this.directory[index];
  }

  public deleteDirectoryContact(id: string): boolean {
    const initialLen = this.directory.length;
    this.directory = this.directory.filter((d) => d.id !== id);
    return this.directory.length < initialLen;
  }

  // --- Emergency Contacts Operations ---
  public getEmergencyContacts(location?: string, complaintType?: string): EmergencyContact[] {
    let list = [...this.emergencyContacts];
    if (complaintType && complaintType !== 'all') {
      const lower = complaintType.toLowerCase();
      // Sort recommended ones to the top
      list.sort((a, b) => {
        const aMatch = a.recommendedFor?.some((r) => r.toLowerCase().includes(lower)) ? 1 : 0;
        const bMatch = b.recommendedFor?.some((r) => r.toLowerCase().includes(lower)) ? 1 : 0;
        return bMatch - aMatch;
      });
    }
    return list;
  }

  // --- College Operations ---
  public getColleges(): College[] {
    return this.colleges;
  }

  public addCollege(college: Omit<College, 'id'>): College {
    const newCollege: College = { ...college, id: `col-${Date.now()}` };
    this.colleges.push(newCollege);
    return newCollege;
  }

  // --- User & Role Verification ---
  public registerUser(user: CurrentUser): { user: CurrentUser; token: string } {
    const id = user.id || `usr-${Date.now()}`;
    const token = `token_${Math.random().toString(36).substring(2)}_${Date.now()}`;

    const savedUser: CurrentUser = {
      ...user,
      id,
      authToken: token,
    };

    const key = user.studentId || user.employeeId || user.email || id;
    this.registeredUsers.set(key, savedUser);
    return { user: savedUser, token };
  }

  public verifyRoleWithPasskey(passkey: string, user: CurrentUser): { success: boolean; message: string; verifiedRole?: Role } {
    const cleanKey = passkey.trim();
    const match = INSTITUTIONAL_PASSKEYS[cleanKey];

    if (!match) {
      return {
        success: false,
        message: 'Invalid institutional passkey. Contact your campus administrator.',
      };
    }

    return {
      success: true,
      message: `Verified successfully as ${match.label}!`,
      verifiedRole: match.role,
    };
  }

  // --- Complaints with Server-side Role Authorization & Anonymization ---
  public getComplaintsForRequester(
    role: Role,
    department?: string,
    studentId?: string,
    isVerified?: boolean
  ): { complaints: Complaint[]; forbidden?: boolean; reason?: string } {
    // 1. Unverified authorities cannot access administrative complaint dossiers!
    if (['HOD', 'Dean', 'Higher Authority'].includes(role) && !isVerified) {
      return {
        complaints: [],
        forbidden: true,
        reason: 'Administrative role must be verified with institutional passkey to view sensitive disciplinary files.',
      };
    }

    if (role === 'Student') {
      // Students only receive their own submitted complaints
      const myReports = this.complaints.filter((c) => c.reporterStudentId === studentId);
      return { complaints: myReports };
    }

    if (role === 'Faculty' || role === 'Other') {
      // Faculty/Other: can see anonymized statistical overview or Level 1 cases for pastoral care
      const anonymized = this.complaints.map((c) => this.stripReporterIdentity(c));
      return { complaints: anonymized };
    }

    let scoped: Complaint[] = [];
    if (role === 'HOD') {
      scoped = this.complaints.filter(
        (c) => c.currentEscalationLevel === 1 && (!department || c.suspect.department === department)
      );
    } else if (role === 'Dean') {
      scoped = this.complaints.filter((c) => c.currentEscalationLevel >= 2);
    } else if (role === 'Higher Authority') {
      scoped = this.complaints.filter((c) => c.currentEscalationLevel >= 3);
    } else {
      scoped = [...this.complaints];
    }

    // PRIVACY ENFORCEMENT: Server strictly redacts student reporter name and ID for ALL authorities!
    const sanitized = scoped.map((c) => this.stripReporterIdentity(c));
    return { complaints: sanitized };
  }

  public getComplaintForTracking(id: string): Partial<Complaint> | null {
    const found = this.complaints.find((c) => c.id === id);
    if (!found) return null;

    // Public tracking strips all personal identities and suspect phone
    return {
      id: found.id,
      category: found.category,
      raggingType: found.raggingType,
      incidentDate: found.incidentDate,
      location: found.location,
      status: found.status,
      currentEscalationLevel: found.currentEscalationLevel,
      escalationHistory: found.escalationHistory,
      severity: found.severity,
      aiSummary: found.aiSummary,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
      // Reporter identity is strictly hidden
      reporterName: 'Confidential Reporter',
      reporterStudentId: 'PROTECTED',
    };
  }

  public addComplaint(complaint: Complaint): { complaint: Complaint; totalComplaintsForSuspect: number } {
    // Check repeat offender count
    const existingAgainstSuspect = this.complaints.filter((c) => {
      const nameMatch = c.suspect.name.trim().toLowerCase() === complaint.suspect.name.trim().toLowerCase();
      const phoneMatch = c.suspect.phone && complaint.suspect.phone && c.suspect.phone === complaint.suspect.phone;
      return nameMatch || phoneMatch;
    });

    const totalCount = existingAgainstSuspect.length + 1;

    // Multi-tier auto-escalation rule:
    // 1st complaint -> Level 1 (HOD)
    // 2nd complaint -> Level 2 (Dean)
    // 3rd complaint or higher -> Level 3 (Higher Authority)
    let assignedLevel: 1 | 2 | 3 = 1;
    if (totalCount === 2) assignedLevel = 2;
    if (totalCount >= 3) assignedLevel = 3;

    complaint.currentEscalationLevel = assignedLevel;

    // If repeat offender, auto-escalate existing complaints as well
    if (totalCount === 2) {
      existingAgainstSuspect.forEach((prev) => {
        if (prev.currentEscalationLevel < 2) {
          prev.currentEscalationLevel = 2;
          prev.escalationHistory.push({
            id: `esc-auto-${Date.now()}-${prev.id}`,
            timestamp: new Date().toISOString(),
            level: 2,
            levelLabel: 'Dean',
            reason: `Auto-escalated: 2nd complaint against suspect (${complaint.id}) received`,
          });
        }
      });
    } else if (totalCount >= 3) {
      existingAgainstSuspect.forEach((prev) => {
        if (prev.currentEscalationLevel < 3) {
          prev.currentEscalationLevel = 3;
          prev.escalationHistory.push({
            id: `esc-auto-${Date.now()}-${prev.id}`,
            timestamp: new Date().toISOString(),
            level: 3,
            levelLabel: 'Higher Authority',
            reason: `Auto-escalated: Repeat offender threshold (Count: ${totalCount}) reached`,
          });
        }
      });
    }

    this.complaints.unshift(complaint);
    return { complaint, totalComplaintsForSuspect: totalCount };
  }

  public updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    noteText: string,
    actorRole: Role,
    actorName: string
  ): Complaint | null {
    const item = this.complaints.find((c) => c.id === id);
    if (!item) return null;

    const now = new Date().toISOString();
    const oldStatus = item.status;
    item.status = status;
    item.updatedAt = now;

    if (noteText && noteText.trim()) {
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
      details: `Status changed from "${oldStatus}" to "${status}". ${noteText ? `Note: "${noteText}"` : ''}`,
    });

    return item;
  }

  public addPrivateNote(
    id: string,
    text: string,
    authorRole: Role,
    authorName: string
  ): Complaint | null {
    const item = this.complaints.find((c) => c.id === id);
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

    return item;
  }

  // ==========================================
  // EMERGENCY SOS OPERATIONS
  // ==========================================

  public triggerSOS(data: {
    student: CurrentUser;
    location?: SOSLocation | null;
    triggerMode?: 'hold_press' | 'instant_tap' | 'discreet_stealth' | 'widget_shortcut';
    locationError?: string;
  }): SOSIncident {
    const now = new Date().toISOString();
    const id = `SOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const incident: SOSIncident = {
      id,
      studentId: data.student.studentId || data.student.id || 'STU-ANON',
      studentName: data.student.name || 'Anonymous Student',
      studentPhone: data.student.phone || '+91 98765 00000',
      studentDepartment: data.student.department,
      campusCode: data.student.campus.campusCode || 'AIST-BLR',
      campusName: data.student.campus.collegeName || 'Apex Institute of Science & Technology',
      status: 'Delivered', // Backend acknowledged immediately
      location: data.location || null,
      locationHistory: data.location ? [data.location] : [],
      locationError: data.locationError,
      triggerMode: data.triggerMode || 'hold_press',
      triggeredAt: now,
      deliveredAt: now,
      dispatchNotes: [
        {
          id: `disp-${Date.now()}`,
          authorRole: 'Higher Authority',
          authorName: 'ZOVA System',
          text: `🚨 High-Priority SOS triggered by student. Campus emergency dispatch notified.`,
          timestamp: now,
        },
      ],
      auditLogs: [
        {
          id: `aud-${Date.now()}-1`,
          timestamp: now,
          action: 'SOS_TRIGGERED',
          actorRole: 'Student',
          actorName: data.student.name,
          details: `Emergency SOS triggered via ${data.triggerMode || 'gesture'}. ${
            data.location
              ? `GPS location locked (lat: ${data.location.latitude.toFixed(4)}, lng: ${data.location.longitude.toFixed(4)}, accuracy: ${data.location.accuracy.toFixed(1)}m).`
              : `Location unavailable: ${data.locationError || 'GPS not permitted'}.`
          }`,
        },
        {
          id: `aud-${Date.now()}-2`,
          timestamp: now,
          action: 'DELIVERED_TO_OFFICERS',
          actorRole: 'System',
          actorName: 'ZOVA Emergency Broker',
          details: `Broadcast sent to Campus Security, Dean, HOD, and Anti-Ragging Cell.`,
        },
      ],
      updatedAt: now,
    };

    this.sosIncidents.unshift(incident);
    return incident;
  }

  public getActiveSOS(campusCode?: string): SOSIncident[] {
    this.checkAndAutoEscalateUnacknowledged();
    return this.sosIncidents.filter((sos) => {
      const isActive = sos.status !== 'Resolved' && sos.status !== 'Cancelled';
      if (!isActive) return false;
      if (!campusCode) return true;
      return sos.campusCode === campusCode;
    });
  }

  public getSOSById(id: string): SOSIncident | null {
    this.checkAndAutoEscalateUnacknowledged();
    return this.sosIncidents.find((sos) => sos.id === id) || null;
  }

  public getSOSHistory(campusCode?: string): SOSIncident[] {
    if (!campusCode) return this.sosIncidents;
    return this.sosIncidents.filter((sos) => sos.campusCode === campusCode);
  }

  public acknowledgeSOS(id: string, actorRole: Role, actorName: string): SOSIncident | null {
    const incident = this.sosIncidents.find((s) => s.id === id);
    if (!incident) return null;

    const now = new Date().toISOString();
    incident.status = 'Acknowledged';
    incident.acknowledgedAt = now;
    incident.acknowledgedBy = { name: actorName, role: actorRole };
    incident.updatedAt = now;

    incident.dispatchNotes.push({
      id: `disp-${Date.now()}`,
      authorRole: actorRole,
      authorName: actorName,
      text: `Alert acknowledged by ${actorRole} (${actorName}). Emergency response activated.`,
      timestamp: now,
    });

    incident.auditLogs.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'SOS_ACKNOWLEDGED',
      actorRole,
      actorName,
      details: `Officer acknowledged the alert and took active responsibility.`,
    });

    return incident;
  }

  public updateSOSStatus(
    id: string,
    status: SOSIncidentStatus,
    actorRole: Role,
    actorName: string,
    note?: string
  ): SOSIncident | null {
    const incident = this.sosIncidents.find((s) => s.id === id);
    if (!incident) return null;

    const now = new Date().toISOString();
    const oldStatus = incident.status;
    incident.status = status;
    incident.updatedAt = now;

    if (status === 'Response in progress' && !incident.responseStartedAt) {
      incident.responseStartedAt = now;
    } else if (status === 'Resolved') {
      incident.resolvedAt = now;
      incident.resolvedBy = { name: actorName, role: actorRole, resolutionNote: note };
    } else if (status === 'Escalated') {
      incident.escalatedAt = now;
      incident.escalatedReason = note || 'Escalated to higher authorities and external police';
    }

    if (note && note.trim()) {
      incident.dispatchNotes.push({
        id: `disp-${Date.now()}`,
        authorRole: actorRole,
        authorName: actorName,
        text: note.trim(),
        timestamp: now,
      });
    }

    incident.auditLogs.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: `STATUS_CHANGED_${status.toUpperCase().replace(/\s+/g, '_')}`,
      actorRole,
      actorName,
      details: `Status transitioned from "${oldStatus}" to "${status}". ${note ? `Note: ${note}` : ''}`,
    });

    return incident;
  }

  public cancelSOS(
    id: string,
    cancelledBy: 'Student' | 'Authority',
    actorName: string,
    reason?: string
  ): SOSIncident | null {
    const incident = this.sosIncidents.find((s) => s.id === id);
    if (!incident) return null;

    const now = new Date().toISOString();
    incident.status = 'Cancelled';
    incident.cancelledAt = now;
    incident.cancelledBy = cancelledBy;
    incident.cancellationReason = reason || 'False alarm / Accidental activation';
    incident.updatedAt = now;

    incident.dispatchNotes.push({
      id: `disp-${Date.now()}`,
      authorRole: (cancelledBy === 'Student' ? 'Student' : 'Higher Authority') as Role,
      authorName: actorName,
      text: `Alert cancelled: "${reason || 'Accidental activation / False alarm'}". Responders stand down.`,
      timestamp: now,
    });

    incident.auditLogs.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'SOS_CANCELLED',
      actorRole: cancelledBy,
      actorName,
      details: `Emergency cancelled. Reason: ${reason || 'Accidental activation / Student safe'}. Authorities notified of cancellation.`,
    });

    return incident;
  }

  public updateSOSLocation(id: string, location: SOSLocation): SOSIncident | null {
    const incident = this.sosIncidents.find((s) => s.id === id);
    if (!incident) return null;

    // Do not update location if incident is resolved or cancelled
    if (incident.status === 'Resolved' || incident.status === 'Cancelled') {
      return incident;
    }

    const now = new Date().toISOString();
    incident.location = location;
    if (!incident.locationHistory) incident.locationHistory = [];
    incident.locationHistory.push(location);
    if (incident.locationHistory.length > 50) {
      incident.locationHistory.shift();
    }
    incident.updatedAt = now;

    return incident;
  }

  public addSOSDispatchNote(
    id: string,
    authorRole: Role,
    authorName: string,
    text: string
  ): SOSIncident | null {
    const incident = this.sosIncidents.find((s) => s.id === id);
    if (!incident) return null;

    const now = new Date().toISOString();
    const noteId = `disp-${Date.now()}`;
    incident.dispatchNotes.push({
      id: noteId,
      authorRole,
      authorName,
      text: text.trim(),
      timestamp: now,
    });

    incident.auditLogs.push({
      id: `aud-${Date.now()}`,
      timestamp: now,
      action: 'DISPATCH_NOTE_ADDED',
      actorRole: authorRole,
      actorName: authorName,
      details: `Dispatch message posted by ${authorRole} (${authorName}).`,
    });

    incident.updatedAt = now;
    return incident;
  }

  public checkAndAutoEscalateUnacknowledged(): SOSIncident[] {
    const escalated: SOSIncident[] = [];
    const now = Date.now();

    for (const incident of this.sosIncidents) {
      if (incident.status === 'Delivered') {
        const triggeredTime = new Date(incident.triggeredAt).getTime();
        // If unacknowledged for > 60 seconds, auto-escalate
        if (now - triggeredTime > 60000) {
          incident.status = 'Escalated';
          incident.escalatedAt = new Date().toISOString();
          incident.escalatedReason = 'Auto-escalation SLA: No campus authority acknowledged within 60 seconds. Elevated to Higher Authority and Emergency Helplines.';
          incident.updatedAt = new Date().toISOString();

          incident.dispatchNotes.push({
            id: `disp-auto-${Date.now()}`,
            authorRole: 'Higher Authority',
            authorName: 'ZOVA Emergency Protocol',
            text: '⚠️ EMERGENCY AUTO-ESCALATED: Alert was not acknowledged within 60 seconds. Escalated to Senior Administration and Police Liaison.',
            timestamp: new Date().toISOString(),
          });

          incident.auditLogs.push({
            id: `aud-esc-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'AUTO_ESCALATION_TRIGGERED',
            actorRole: 'System',
            actorName: 'ZOVA SLA Engine',
            details: 'Automatic emergency escalation triggered due to unacknowledged SLA breach (>60s).',
          });

          escalated.push(incident);
        }
      }
    }

    return escalated;
  }

  public resetToDefaultDemo(): void {
    this.complaints = [...INITIAL_COMPLAINTS];
    this.directory = [...DEFAULT_DIRECTORY];
    this.emergencyContacts = [...DEFAULT_EMERGENCY_CONTACTS];
  }

  private stripReporterIdentity(complaint: Complaint): Complaint {
    return {
      ...complaint,
      reporterName: '[Protected Student Identity]',
      reporterStudentId: '[Protected]',
    };
  }
}

export const serverDb = new ServerDatabase();
