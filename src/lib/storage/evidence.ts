import { createClient } from '@/lib/supabase/client';
import { EvidenceType } from '@/types/database';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export interface UploadEvidenceParams {
  complaintId: string;
  file: File;
  evidenceType: EvidenceType;
  notes?: string;
  userId: string;
}

export async function uploadComplaintEvidence({
  complaintId,
  file,
  evidenceType,
  notes,
  userId,
}: UploadEvidenceParams): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  // 1. Validation
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Invalid file format (${file.type}). Allowed formats: JPG, PNG, WEBP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  const supabase = createClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `complaints/${complaintId}/${evidenceType}/${cleanFileName}`;

  try {
    // 2. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('civic-evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      return { success: false, error: uploadError.message };
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('civic-evidence')
      .getPublicUrl(filePath);

    // 4. Record evidence row in PostgreSQL
    const { error: dbError } = await supabase
      .from('complaint_evidence')
      .insert({
        complaint_id: complaintId,
        uploaded_by: userId,
        file_url: publicUrl,
        file_type: file.type,
        file_name: file.name,
        file_size: file.size,
        evidence_type: evidenceType,
        notes: notes || null,
      });

    if (dbError) {
      console.error('Database evidence recording error:', dbError.message);
      return { success: false, error: dbError.message };
    }

    return { success: true, fileUrl: publicUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    return { success: false, error: message };
  }
}
