import { createClient } from '@/lib/supabase/client';
import { ComplaintStatus, UserRole, ALLOWED_STATUS_TRANSITIONS } from '@/types/database';

export interface WorkflowTransitionParams {
  complaintId: string;
  currentStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  userId: string;
  userRole: UserRole;
  remarks?: string;
  engineerId?: string;
  assignmentInstructions?: string;
  departmentId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export function isValidTransition(
  currentStatus: ComplaintStatus,
  newStatus: ComplaintStatus,
  role: UserRole
): { valid: boolean; reason?: string } {
  const allowedRules = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedRules || allowedRules.length === 0) {
    return { valid: false, reason: `Status ${currentStatus} cannot be transitioned further.` };
  }

  const matchingRule = allowedRules.find((rule) => rule.next.includes(newStatus));
  if (!matchingRule) {
    return {
      valid: false,
      reason: `Direct transition from ${currentStatus} to ${newStatus} is prohibited in the workflow.`,
    };
  }

  if (!matchingRule.allowedRoles.includes(role)) {
    return {
      valid: false,
      reason: `Your role (${role}) does not have permission to transition complaints from ${currentStatus} to ${newStatus}.`,
    };
  }

  return { valid: true };
}

export async function executeWorkflowTransition(params: WorkflowTransitionParams) {
  const {
    complaintId,
    currentStatus,
    newStatus,
    userId,
    userRole,
    remarks,
    engineerId,
    assignmentInstructions,
    departmentId,
    priority,
  } = params;

  // 1. Verify workflow rules
  const validation = isValidTransition(currentStatus, newStatus, userRole);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }

  const supabase = createClient();

  try {
    // 2. Prepare complaint update payload
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (remarks) {
      if (newStatus === 'REJECTED') {
        updatePayload.rejection_reason = remarks;
      } else if (newStatus === 'UNDER_VERIFICATION') {
        updatePayload.verification_remarks = remarks;
      } else if (newStatus === 'RESOLVED') {
        updatePayload.resolution_notes = remarks;
      }
    }

    if (departmentId) {
      updatePayload.department_id = departmentId;
    }

    if (priority) {
      updatePayload.priority = priority;
    }

    if (newStatus === 'ASSIGNED') {
      updatePayload.assigned_at = new Date().toISOString();
    } else if (newStatus === 'IN_PROGRESS') {
      updatePayload.in_progress_at = new Date().toISOString();
    } else if (newStatus === 'RESOLVED') {
      updatePayload.resolved_at = new Date().toISOString();
    } else if (newStatus === 'CLOSED') {
      updatePayload.closed_at = new Date().toISOString();
    }

    // 3. Update the complaint
    const { error: updateError } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', complaintId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 4. Record status history
    await supabase.from('complaint_status_history').insert({
      complaint_id: complaintId,
      old_status: currentStatus,
      new_status: newStatus,
      changed_by: userId,
      remarks: remarks || null,
    });

    // 5. If transition is ASSIGNED, create assignment record
    if (newStatus === 'ASSIGNED' && engineerId) {
      await supabase.from('complaint_assignments').insert({
        complaint_id: complaintId,
        engineer_id: engineerId,
        assigned_by: userId,
        instructions: assignmentInstructions || null,
        status: 'ACTIVE',
      });
    }

    // 6. Fetch complaint details for notification recipients
    const { data: complaintData } = await supabase
      .from('complaints')
      .select('citizen_id, complaint_reference, title')
      .eq('id', complaintId)
      .single();

    if (complaintData) {
      // Notify citizen of the status transition
      await supabase.from('notifications').insert({
        user_id: complaintData.citizen_id,
        complaint_id: complaintId,
        title: `Complaint Status: ${newStatus.replace('_', ' ')}`,
        message: `Your complaint #${complaintData.complaint_reference} ("${complaintData.title}") has transitioned to ${newStatus.replace('_', ' ')}. ${remarks ? `Remarks: ${remarks}` : ''}`,
        type: 'STATUS_CHANGE',
      });

      // If assigned to engineer, notify engineer
      if (newStatus === 'ASSIGNED' && engineerId) {
        await supabase.from('notifications').insert({
          user_id: engineerId,
          complaint_id: complaintId,
          title: 'New Complaint Assignment',
          message: `You have been assigned to complaint #${complaintData.complaint_reference} ("${complaintData.title}").`,
          type: 'ASSIGNMENT',
        });
      }
    }

    // 7. Record Audit Log
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: `COMPLAINT_STATUS_CHANGE_${newStatus}`,
      entity_type: 'complaint',
      entity_id: complaintId,
      metadata: {
        from: currentStatus,
        to: newStatus,
        remarks,
        engineerId,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Workflow transition error';
    return { success: false, error: message };
  }
}
