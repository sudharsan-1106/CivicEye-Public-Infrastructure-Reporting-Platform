import { createClient } from '@/lib/supabase/client';
import { Department, IssueCategory, Profile, AuditLog } from '@/types/database';

export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Roads & Highways Department',
    code: 'ROADS',
    description: 'Maintenance of city roads, pavements, potholes, bridges, and flyovers.',
    contact_email: 'roads@civiceye.gov',
    contact_phone: '+1-800-555-0101',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'Electrical & Public Lighting',
    code: 'ELEC',
    description: 'Streetlights, traffic lights, and municipal electrical infrastructure.',
    contact_email: 'power@civiceye.gov',
    contact_phone: '+1-800-555-0102',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'Sanitation & Waste Management',
    code: 'SANIT',
    description: 'Garbage collection, solid waste disposal, and street sweeping.',
    contact_email: 'sanitation@civiceye.gov',
    contact_phone: '+1-800-555-0103',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    name: 'Water Supply & Sewerage Board',
    code: 'WATER',
    description: 'Clean water distribution, pipeline leakages, drainage, and stormwater management.',
    contact_email: 'water@civiceye.gov',
    contact_phone: '+1-800-555-0104',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000005',
    name: 'Public Works & Property',
    code: 'WORKS',
    description: 'Public buildings, parks, sidewalks, signs, and civic structures.',
    contact_email: 'publicworks@civiceye.gov',
    contact_phone: '+1-800-555-0105',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000006',
    name: 'Traffic Infrastructure & Signals',
    code: 'TRAFFIC',
    description: 'Bollards, lane markings, pedestrian crossings, speed humps, and traffic signage.',
    contact_email: 'traffic@civiceye.gov',
    contact_phone: '+1-800-555-0106',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_ISSUE_CATEGORIES: IssueCategory[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    name: 'Roads & Potholes',
    description: 'Potholes, broken asphalt, damaged pavements, curb damage, or sinking road segments.',
    icon: 'Construction',
    department_id: 'a1000000-0000-0000-0000-000000000001',
    default_priority: 'HIGH',
    sla_hours: 48,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    name: 'Streetlight Failures',
    description: 'Dark streetlights, flickering lamps, exposed electric wires, or fallen lamp poles.',
    icon: 'Zap',
    department_id: 'a1000000-0000-0000-0000-000000000002',
    default_priority: 'MEDIUM',
    sla_hours: 24,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    name: 'Garbage & Sanitation',
    description: 'Overflowing trash bins, illegal dumping, unsanitary public areas, or missed garbage collection.',
    icon: 'Trash2',
    department_id: 'a1000000-0000-0000-0000-000000000003',
    default_priority: 'MEDIUM',
    sla_hours: 24,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    name: 'Water Supply & Leakage',
    description: 'Burst water mains, dirty tap water supply, low water pressure, or broken public valves.',
    icon: 'Droplets',
    department_id: 'a1000000-0000-0000-0000-000000000004',
    default_priority: 'HIGH',
    sla_hours: 36,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000005',
    name: 'Drainage & Waterlogging',
    description: 'Clogged storm drains, flooded roads during rain, open manholes, or sewer overflow.',
    icon: 'Waves',
    department_id: 'a1000000-0000-0000-0000-000000000004',
    default_priority: 'CRITICAL',
    sla_hours: 12,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000006',
    name: 'Public Property Damage',
    description: 'Damaged bus stops, broken park benches, vandalized statues, or collapsed perimeter walls.',
    icon: 'Building2',
    department_id: 'a1000000-0000-0000-0000-000000000005',
    default_priority: 'LOW',
    sla_hours: 96,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000007',
    name: 'Traffic Infrastructure & Signage',
    description: 'Defective traffic signals, missing stop signs, knocked-down guardrails, or faded crosswalks.',
    icon: 'TrafficCone',
    department_id: 'a1000000-0000-0000-0000-000000000006',
    default_priority: 'HIGH',
    sla_hours: 24,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'b1000000-0000-0000-0000-000000000008',
    name: 'General Public Hazards',
    description: 'All other immediate civic infrastructure hazards requiring department inspection.',
    icon: 'ShieldAlert',
    department_id: null,
    default_priority: 'MEDIUM',
    sla_hours: 72,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function getDepartments(): Promise<Department[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Departments fetch issue (using defaults):', error.message);
      return DEFAULT_DEPARTMENTS;
    }

    return (data as Department[]);
  } catch (err) {
    console.warn('Departments fetch fallback:', err);
    return DEFAULT_DEPARTMENTS;
  }
}

export async function getIssueCategories(): Promise<IssueCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('issue_categories')
      .select('*, department:departments(*)')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Issue categories fetch issue (using defaults):', error.message);
      return DEFAULT_ISSUE_CATEGORIES;
    }

    return (data as unknown as IssueCategory[]);
  } catch (err) {
    console.warn('Issue categories fetch fallback:', err);
    return DEFAULT_ISSUE_CATEGORIES;
  }
}

export async function getFieldEngineers(departmentId?: string): Promise<Profile[]> {
  const supabase = createClient();
  let query = supabase
    .from('profiles')
    .select('*, department:departments(*)')
    .eq('role', 'field_engineer')
    .eq('is_active', true);

  if (departmentId) {
    query = query.eq('department_id', departmentId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching field engineers:', error.message);
    return [];
  }
  return (data as Profile[]) || [];
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*, department:departments(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error.message);
    return [];
  }

  return (data as Profile[]) || [];
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  return { success: !error, error: error?.message };
}

export async function updateUserRole(userId: string, role: string, departmentId?: string | null) {
  const supabase = createClient();
  const updatePayload: Record<string, unknown> = { role };
  if (departmentId !== undefined) {
    updatePayload.department_id = departmentId;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId);

  return { success: !error, error: error?.message };
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, user:profiles(id, full_name, email, role)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching audit logs:', error.message);
    return [];
  }

  return (data as unknown as AuditLog[]) || [];
}
