export type UserRole = 'citizen' | 'department_officer' | 'field_engineer' | 'administrator';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EvidenceType = 'issue' | 'progress' | 'resolution';

export type AssignmentStatus = 'ACTIVE' | 'REASSIGNED' | 'COMPLETED';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department_id: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface IssueCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  department_id: string | null;
  default_priority: Priority;
  sla_hours: number;
  is_active: boolean;
  created_at: string;
  department?: Department | null;
}

export interface ComplaintEvidence {
  id: string;
  complaint_id: string;
  uploaded_by: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number | null;
  evidence_type: EvidenceType;
  notes: string | null;
  created_at: string;
  uploader?: Profile;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_by: string;
  remarks: string | null;
  created_at: string;
  changer?: Profile;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  engineer_id: string;
  assigned_by: string;
  instructions: string | null;
  assigned_at: string;
  unassigned_at: string | null;
  status: AssignmentStatus;
  engineer?: Profile;
  assigner?: Profile;
}

export interface Complaint {
  id: string;
  complaint_reference: string;
  citizen_id: string;
  department_id: string | null;
  category_id: string;
  title: string;
  description: string;
  priority: Priority;
  status: ComplaintStatus;
  latitude: number | null;
  longitude: number | null;
  address: string;
  rejection_reason: string | null;
  verification_remarks: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  verified_at: string | null;
  assigned_at: string | null;
  in_progress_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  citizen?: Profile;
  department?: Department | null;
  category?: IssueCategory;
  evidence?: ComplaintEvidence[];
  status_history?: ComplaintStatusHistory[];
  assignments?: ComplaintAssignment[];
}

export interface Notification {
  id: string;
  user_id: string;
  complaint_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  complaint?: {
    id: string;
    complaint_reference: string;
    title: string;
  } | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: Profile | null;
}

// Role-based Workflow Transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<
  ComplaintStatus,
  { next: ComplaintStatus[]; allowedRoles: UserRole[] }[]
> = {
  SUBMITTED: [
    { next: ['UNDER_VERIFICATION'], allowedRoles: ['department_officer', 'administrator'] },
  ],
  UNDER_VERIFICATION: [
    { next: ['REJECTED'], allowedRoles: ['department_officer', 'administrator'] },
    { next: ['ASSIGNED'], allowedRoles: ['department_officer', 'administrator'] },
  ],
  REJECTED: [],
  ASSIGNED: [
    { next: ['IN_PROGRESS'], allowedRoles: ['field_engineer', 'administrator'] },
  ],
  IN_PROGRESS: [
    { next: ['RESOLVED'], allowedRoles: ['field_engineer', 'administrator'] },
  ],
  RESOLVED: [
    { next: ['CLOSED'], allowedRoles: ['department_officer', 'administrator'] },
  ],
  CLOSED: [],
};
