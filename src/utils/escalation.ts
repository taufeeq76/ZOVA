import { Complaint, EscalationLevel, EscalationHistoryItem, Suspect } from '../types/index.ts';

/**
 * Extracts digits only from a phone number string.
 */
export function sanitizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Checks if two suspects represent the same person according to policy:
 * - Match the suspect by phone number (digits only, matching 10-digit suffix or exact string).
 * - If no valid phone on either or one, fallback to matching by trimmed lowercase name + department.
 */
export function isSameSuspect(a: Suspect, b: Suspect): boolean {
  const phoneA = sanitizePhone(a.phone);
  const phoneB = sanitizePhone(b.phone);

  if (phoneA.length >= 7 && phoneB.length >= 7) {
    if (phoneA.length >= 10 && phoneB.length >= 10) {
      return phoneA.slice(-10) === phoneB.slice(-10);
    }
    return phoneA === phoneB;
  }

  const nameA = a.name.trim().toLowerCase();
  const nameB = b.name.trim().toLowerCase();
  const deptA = a.department.trim().toLowerCase();
  const deptB = b.department.trim().toLowerCase();

  return nameA.length > 0 && nameA === nameB && deptA === deptB;
}

/**
 * Helper to get label for an escalation level.
 */
export function getEscalationLabel(level: EscalationLevel): 'HOD' | 'Dean' | 'Higher Authority' {
  switch (level) {
    case 1:
      return 'HOD';
    case 2:
      return 'Dean';
    case 3:
      return 'Higher Authority';
  }
}

/**
 * Helper to get the canonical badge text for an escalation level.
 */
export function getEscalationBadgeText(level: EscalationLevel): string {
  return `Escalated to ${getEscalationLabel(level)}`;
}

export interface EscalationResult {
  updatedComplaints: Complaint[];
  newComplaintEscalationLevel: EscalationLevel;
  totalComplaintsForSuspect: number;
}

/**
 * Pure function to evaluate and apply automatic escalation when a new complaint is added.
 *
 * Rules:
 * - Match earlier complaints against the same suspect by phone number (digits only) or lowercase name + department.
 * - Count complaints against that suspect:
 *   1st complaint → HOD of the suspect's department (Level 1)
 *   2nd complaint → Dean (Level 2)
 *   3rd or more complaints → Higher Authority (Level 3)
 * - When a complaint escalates, update ALL earlier complaints against that suspect to the new level
 *   and log the change in each complaint's escalation history with timestamp and reason.
 *
 * @param existingComplaints - Array of all complaints currently in database
 * @param newComplaint - The newly submitted complaint
 * @returns Updated array containing all complaints with escalation adjustments and the new complaint
 */
export function processComplaintEscalation(
  existingComplaints: Complaint[],
  newComplaint: Complaint
): EscalationResult {
  // Find all existing complaints matching this suspect
  const matchingIndices: number[] = [];
  existingComplaints.forEach((c, index) => {
    if (isSameSuspect(c.suspect, newComplaint.suspect)) {
      matchingIndices.push(index);
    }
  });

  const totalComplaintsForSuspect = matchingIndices.length + 1;
  const now = new Date().toISOString();

  // Determine target escalation level
  let targetLevel: EscalationLevel = 1;
  if (totalComplaintsForSuspect === 1) {
    targetLevel = 1; // 1st complaint -> suspect's department HOD
  } else if (totalComplaintsForSuspect === 2) {
    targetLevel = 2; // 2nd complaint -> Dean
  } else {
    targetLevel = 3; // 3rd or more -> Higher Authority
  }

  const ordinal =
    totalComplaintsForSuspect === 1
      ? '1st'
      : totalComplaintsForSuspect === 2
      ? '2nd'
      : totalComplaintsForSuspect === 3
      ? '3rd'
      : `${totalComplaintsForSuspect}th`;

  const newReason =
    totalComplaintsForSuspect === 1
      ? `Initial complaint assigned to HOD (${newComplaint.suspect.department})`
      : `Auto-escalated: ${ordinal} complaint received against suspect (Escalated to ${getEscalationLabel(targetLevel)})`;

  // Clone existing complaints array to maintain pure function contract
  const updatedComplaints: Complaint[] = existingComplaints.map((c) => ({
    ...c,
    escalationHistory: [...c.escalationHistory],
    auditLogs: [...c.auditLogs],
  }));

  // When it escalates, update all earlier complaints against that suspect
  // and log the change in each complaint's history
  if (targetLevel > 1) {
    matchingIndices.forEach((idx) => {
      const prevComplaint = updatedComplaints[idx];
      if (prevComplaint.currentEscalationLevel < targetLevel) {
        const historyItem: EscalationHistoryItem = {
          id: `esc-${Date.now()}-${prevComplaint.id}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: now,
          level: targetLevel,
          levelLabel: getEscalationLabel(targetLevel),
          reason: `Auto-escalated: ${ordinal} complaint received against suspect (Escalated to ${getEscalationLabel(targetLevel)})`,
        };

        prevComplaint.currentEscalationLevel = targetLevel;
        prevComplaint.escalationHistory.push(historyItem);
        prevComplaint.updatedAt = now;
        prevComplaint.auditLogs.push({
          id: `aud-${Date.now()}-${prevComplaint.id}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: now,
          actorRole: 'Higher Authority',
          actorName: 'ZOVA Auto-Escalation Engine',
          action: `ESCALATED_TO_${getEscalationLabel(targetLevel).toUpperCase().replace(/\s+/g, '_')}`,
          details: `Auto-escalated: ${ordinal} complaint received against suspect (${newComplaint.suspect.name}). Escalated to ${getEscalationLabel(targetLevel)}.`,
        });
      }
    });
  }

  // Setup history for the newly submitted complaint
  const newHistoryItem: EscalationHistoryItem = {
    id: `esc-new-${Date.now()}-${newComplaint.id || 'new'}`,
    timestamp: now,
    level: targetLevel,
    levelLabel: getEscalationLabel(targetLevel),
    reason: newReason,
  };

  const finalNewComplaint: Complaint = {
    ...newComplaint,
    currentEscalationLevel: targetLevel,
    escalationHistory: [newHistoryItem],
    auditLogs: [
      {
        id: `aud-sub-${Date.now()}`,
        timestamp: now,
        actorRole: 'Student',
        actorName: 'Anonymous Reporter',
        action: 'COMPLAINT_FILED',
        details: `Report filed with Escalated to ${getEscalationLabel(targetLevel)}. ${newReason}`,
      },
      ...newComplaint.auditLogs,
    ],
    updatedAt: now,
  };

  return {
    updatedComplaints: [finalNewComplaint, ...updatedComplaints],
    newComplaintEscalationLevel: targetLevel,
    totalComplaintsForSuspect,
  };
}
