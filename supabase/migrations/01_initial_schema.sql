-- ====================================================================
-- CivicEye – Public Infrastructure Reporting System
-- Database Schema & Row Level Security Policies
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM / REFERENCE SEQUENCES
CREATE SEQUENCE IF NOT EXISTS complaint_ref_seq START WITH 1001;

-- Function to generate human-readable reference IDs: CE-YYYY-XXXXXX
CREATE OR REPLACE FUNCTION generate_complaint_reference()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  seq_num TEXT;
BEGIN
  current_year := to_char(CURRENT_DATE, 'YYYY');
  seq_num := lpad(nextval('complaint_ref_seq')::TEXT, 6, '0');
  RETURN 'CE-' || current_year || '-' || seq_num;
END;
$$ LANGUAGE plpgsql;

-- 3. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'department_officer', 'field_engineer', 'administrator')) DEFAULT 'citizen',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function to get the current user's role safely
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'citizen');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to get current user's department ID
CREATE OR REPLACE FUNCTION public.get_auth_user_department()
RETURNS UUID AS $$
DECLARE
  dept_id UUID;
BEGIN
  SELECT department_id INTO dept_id FROM public.profiles WHERE id = auth.uid();
  RETURN dept_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. ISSUE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.issue_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'AlertTriangle',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  default_priority TEXT NOT NULL CHECK (default_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  sla_hours INTEGER NOT NULL DEFAULT 72,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_reference TEXT NOT NULL UNIQUE DEFAULT generate_complaint_reference(),
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES public.issue_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  status TEXT NOT NULL CHECK (status IN (
    'SUBMITTED',
    'UNDER_VERIFICATION',
    'REJECTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
  )) DEFAULT 'SUBMITTED',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT NOT NULL,
  rejection_reason TEXT,
  verification_remarks TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  assigned_at TIMESTAMPTZ,
  in_progress_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Indexing for high-performance complaint querying
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON public.complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ref ON public.complaints(complaint_reference);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON public.complaints(created_at DESC);

-- 7. COMPLAINT STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint ON public.complaint_status_history(complaint_id, created_at ASC);

-- 8. COMPLAINT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  engineer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  instructions TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'REASSIGNED', 'COMPLETED')) DEFAULT 'ACTIVE'
);

CREATE INDEX IF NOT EXISTS idx_assignments_complaint ON public.complaint_assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_assignments_engineer ON public.complaint_assignments(engineer_id);

-- 9. COMPLAINT EVIDENCE
CREATE TABLE IF NOT EXISTS public.complaint_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('issue', 'progress', 'resolution')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON public.complaint_evidence(complaint_id);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'STATUS_UPDATE',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- ====================================================================
-- TRIGGERS & AUTOMATION
-- ====================================================================

-- Auto create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_departments_timestamp BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_complaints_timestamp BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto status timestamp handler
CREATE OR REPLACE FUNCTION public.handle_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status <> OLD.status THEN
    IF NEW.status = 'UNDER_VERIFICATION' AND NEW.verified_at IS NULL THEN
      -- In verification
    ELSIF NEW.status = 'ASSIGNED' THEN
      NEW.assigned_at = COALESCE(NEW.assigned_at, now());
    ELSIF NEW.status = 'IN_PROGRESS' THEN
      NEW.in_progress_at = COALESCE(NEW.in_progress_at, now());
    ELSIF NEW.status = 'RESOLVED' THEN
      NEW.resolved_at = COALESCE(NEW.resolved_at, now());
    ELSIF NEW.status = 'CLOSED' THEN
      NEW.closed_at = COALESCE(NEW.closed_at, now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaint_status_timestamp_trigger
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_complaint_status_change();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. DEPARTMENTS POLICIES
CREATE POLICY "Departments are viewable by all authenticated users"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Departments are manageable only by administrators"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.get_auth_user_role() = 'administrator');

-- 2. ISSUE CATEGORIES POLICIES
CREATE POLICY "Categories are viewable by all"
  ON public.issue_categories FOR SELECT
  TO authenticated, anon
  USING (is_active = true OR public.get_auth_user_role() = 'administrator');

CREATE POLICY "Categories are manageable only by administrators"
  ON public.issue_categories FOR ALL
  TO authenticated
  USING (public.get_auth_user_role() = 'administrator');

-- 3. PROFILES POLICIES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    public.get_auth_user_role() IN ('administrator', 'department_officer') OR
    role IN ('field_engineer', 'department_officer')
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Prevent non-admins from changing their role or department
    (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.get_auth_user_role() = 'administrator')
  );

CREATE POLICY "Administrators have full control on profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.get_auth_user_role() = 'administrator');

-- 4. COMPLAINTS POLICIES
CREATE POLICY "Citizens can view own complaints"
  ON public.complaints FOR SELECT
  TO authenticated
  USING (
    citizen_id = auth.uid() OR
    public.get_auth_user_role() = 'administrator' OR
    (
      public.get_auth_user_role() = 'department_officer' AND
      (department_id IS NULL OR department_id = public.get_auth_user_department())
    ) OR
    (
      public.get_auth_user_role() = 'field_engineer' AND
      id IN (SELECT complaint_id FROM public.complaint_assignments WHERE engineer_id = auth.uid() AND status = 'ACTIVE')
    )
  );

CREATE POLICY "Citizens can insert complaints"
  ON public.complaints FOR INSERT
  TO authenticated
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "Officers can update department complaints"
  ON public.complaints FOR UPDATE
  TO authenticated
  USING (
    public.get_auth_user_role() = 'administrator' OR
    (
      public.get_auth_user_role() = 'department_officer' AND
      (department_id IS NULL OR department_id = public.get_auth_user_department())
    ) OR
    (
      public.get_auth_user_role() = 'field_engineer' AND
      id IN (SELECT complaint_id FROM public.complaint_assignments WHERE engineer_id = auth.uid() AND status = 'ACTIVE')
    )
  );

-- 5. COMPLAINT STATUS HISTORY POLICIES
CREATE POLICY "Status history is viewable by users with complaint access"
  ON public.complaint_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_status_history.complaint_id AND (
        c.citizen_id = auth.uid() OR
        public.get_auth_user_role() IN ('administrator', 'department_officer', 'field_engineer')
      )
    )
  );

CREATE POLICY "Authenticated users can insert status history"
  ON public.complaint_status_history FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());

-- 6. COMPLAINT ASSIGNMENTS POLICIES
CREATE POLICY "Assignments viewable by involved staff or admin"
  ON public.complaint_assignments FOR SELECT
  TO authenticated
  USING (
    public.get_auth_user_role() IN ('administrator', 'department_officer') OR
    engineer_id = auth.uid()
  );

CREATE POLICY "Assignments insertable by officers and admin"
  ON public.complaint_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_auth_user_role() IN ('administrator', 'department_officer')
  );

CREATE POLICY "Assignments updatable by officers, engineers, admin"
  ON public.complaint_assignments FOR UPDATE
  TO authenticated
  USING (
    public.get_auth_user_role() IN ('administrator', 'department_officer') OR
    engineer_id = auth.uid()
  );

-- 7. COMPLAINT EVIDENCE POLICIES
CREATE POLICY "Evidence viewable by anyone who can view the complaint"
  ON public.complaint_evidence FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_evidence.complaint_id AND (
        c.citizen_id = auth.uid() OR
        public.get_auth_user_role() IN ('administrator', 'department_officer', 'field_engineer')
      )
    )
  );

CREATE POLICY "Evidence can be inserted by complaint participants"
  ON public.complaint_evidence FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
  );

-- 8. NOTIFICATIONS POLICIES
CREATE POLICY "Users can only view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System/users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 9. AUDIT LOGS POLICIES
CREATE POLICY "Audit logs viewable only by administrators"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.get_auth_user_role() = 'administrator');

CREATE POLICY "Audit logs insertable by authenticated users"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ====================================================================
-- STORAGE BUCKETS (Run in Supabase Storage setup or SQL)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('civic-evidence', 'civic-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy
CREATE POLICY "Public read evidence"
  ON storage.objects FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'civic-evidence');

CREATE POLICY "Authenticated users can upload evidence"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'civic-evidence');
