import { createClient } from '@/lib/supabase/client';
import { Complaint, ComplaintStatus, Priority } from '@/types/database';

export interface ComplaintFilterParams {
  search?: string;
  categoryId?: string;
  status?: ComplaintStatus | 'ALL';
  priority?: Priority | 'ALL';
  departmentId?: string;
  citizenId?: string;
  engineerId?: string;
  page?: number;
  pageSize?: number;
}

export async function getComplaints(params: ComplaintFilterParams = {}) {
  const supabase = createClient();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('complaints')
    .select(
      `
      *,
      citizen:profiles!citizen_id(id, full_name, email, phone),
      department:departments(id, name, code),
      category:issue_categories(id, name, icon),
      assignments:complaint_assignments(
        id, engineer_id, status,
        engineer:profiles!engineer_id(id, full_name, email, phone)
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.search) {
    query = query.or(
      `complaint_reference.ilike.%${params.search}%,title.ilike.%${params.search}%,address.ilike.%${params.search}%`
    );
  }

  if (params.categoryId) {
    query = query.eq('category_id', params.categoryId);
  }

  if (params.status && params.status !== 'ALL') {
    query = query.eq('status', params.status);
  }

  if (params.priority && params.priority !== 'ALL') {
    query = query.eq('priority', params.priority);
  }

  if (params.departmentId) {
    query = query.eq('department_id', params.departmentId);
  }

  if (params.citizenId) {
    query = query.eq('citizen_id', params.citizenId);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching complaints:', error.message);
    return { data: [] as Complaint[], total: 0, error: error.message };
  }

  // Filter by engineer if requested
  let filteredData = (data as unknown as Complaint[]) || [];
  if (params.engineerId) {
    filteredData = filteredData.filter((c) =>
      c.assignments?.some((a) => a.engineer_id === params.engineerId && a.status === 'ACTIVE')
    );
  }

  return {
    data: filteredData,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getComplaintById(id: string): Promise<{ data: Complaint | null; error?: string }> {
  const supabase = createClient();
  const trimmedId = id.trim();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmedId);

  let query = supabase
    .from('complaints')
    .select(`
      *,
      citizen:profiles!citizen_id(id, full_name, email, phone),
      department:departments(id, name, code, contact_email, contact_phone),
      category:issue_categories(id, name, icon, sla_hours),
      evidence:complaint_evidence(*, uploader:profiles!uploaded_by(id, full_name, role)),
      status_history:complaint_status_history(*, changer:profiles!changed_by(id, full_name, role)),
      assignments:complaint_assignments(*, engineer:profiles!engineer_id(id, full_name, email, phone), assigner:profiles!assigned_by(id, full_name))
    `);

  if (isUUID) {
    query = query.eq('id', trimmedId);
  } else {
    query = query.eq('complaint_reference', trimmedId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as unknown as Complaint };
}

export interface CreateComplaintInput {
  citizenId: string;
  categoryId: string;
  departmentId?: string | null;
  title: string;
  description: string;
  priority: Priority;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function createComplaint(input: CreateComplaintInput) {
  const supabase = createClient();

  try {
    // 1. Insert complaint
    const { data: newComplaint, error: insertError } = await supabase
      .from('complaints')
      .insert({
        citizen_id: input.citizenId,
        category_id: input.categoryId,
        department_id: input.departmentId || null,
        title: input.title,
        description: input.description,
        priority: input.priority,
        address: input.address,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    // 2. Initial status history
    await supabase.from('complaint_status_history').insert({
      complaint_id: newComplaint.id,
      old_status: null,
      new_status: 'SUBMITTED',
      changed_by: input.citizenId,
      remarks: 'Initial complaint registration',
    });

    // 3. Notification to citizen
    await supabase.from('notifications').insert({
      user_id: input.citizenId,
      complaint_id: newComplaint.id,
      title: 'Complaint Registered',
      message: `Your complaint #${newComplaint.complaint_reference} has been submitted successfully and is queued for verification.`,
      type: 'CREATION',
    });

    // 4. Audit Log
    await supabase.from('audit_logs').insert({
      user_id: input.citizenId,
      action: 'COMPLAINT_CREATED',
      entity_type: 'complaint',
      entity_id: newComplaint.id,
      metadata: {
        reference: newComplaint.complaint_reference,
        title: newComplaint.title,
        category: input.categoryId,
      },
    });

    return { success: true, complaint: newComplaint };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create complaint';
    return { success: false, error: message };
  }
}
