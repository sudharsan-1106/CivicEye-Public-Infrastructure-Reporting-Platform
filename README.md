# CivicEye – Public Infrastructure Reporting System

A centralized municipal public infrastructure reporting, grievance redressal, and field dispatch management platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, Storage, Realtime)**.

---

## 🏛️ System Architecture

CivicEye connects citizens directly with municipal departments through an auditable, role-governed lifecycle:

```
Citizen Reports Issue (GPS + Evidence)
                 ↓
     Complaint SUBMITTED
                 ↓
Department Officer Verifies Complaint
         ↙              ↘
If Invalid: REJECTED    If Valid: ASSIGNED (to Field Engineer)
                                 ↓
                     Field Engineer Commences Work
                                 ↓
                            IN_PROGRESS
                                 ↓
                     Field Engineer Uploads Proof
                                 ↓
                             RESOLVED
                                 ↓
               Department Officer Reviews Resolution
                                 ↓
                              CLOSED
                                 ↓
               Citizen Receives Real-time Updates
```

---

## 👥 Four Real User Roles & RBAC Matrix

| Role | Permissions & Capabilities |
| :--- | :--- |
| **CITIZEN** | Register, file grievances with GPS map pin & photos, track complaint timeline, view notification center, view personal dashboard. |
| **DEPARTMENT_OFFICER** | Manage department-specific queue, verify complaints, reject with reasons, dispatch active field engineers, review resolution evidence, formally close complaints. |
| **FIELD_ENGINEER** | View assigned repair tasks, update status to `IN_PROGRESS`, attach progress photos, upload resolution evidence, mark work as `RESOLVED`. |
| **ADMINISTRATOR** | System-wide observability, manage users and roles (`/admin/users`), configure departments and categories, review security audit logs (`/admin/audit-logs`). |

---

## 🗄️ Database Architecture & PostgreSQL Schema

All SQL migrations and seed data are included in `supabase/migrations/01_initial_schema.sql` and `supabase/seed.sql`:

1. **`departments`** – Municipal divisions (Roads, Electrical, Sanitation, Water, Public Works, Traffic)
2. **`profiles`** – User profiles linked to `auth.users`, storing `role`, `department_id`, phone, and activity status.
3. **`issue_categories`** – Pre-configured civic categories with SLAs (e.g. 12h, 24h, 48h) and department routing.
4. **`complaints`** – Grievances with human-readable sequence IDs (e.g., `CE-2026-001001`), GPS coordinates, and addresses.
5. **`complaint_status_history`** – Complete audit trail for every status transition with remarks and timestamps.
6. **`complaint_assignments`** – Tracks field engineer dispatch history, instructions, and completion status.
7. **`complaint_evidence`** – Supabase storage photo URLs for `issue`, `progress`, and `resolution` stages.
8. **`notifications`** – In-app real-time notification records with unread counters.
9. **`audit_logs`** – Immutable administrative security log recording all state transitions and permission changes.

---

## 🔐 Database Security & Row Level Security (RLS)

- **Citizens**: Restricted via PostgreSQL RLS to reading only their own complaints and notifications.
- **Department Officers**: Restricted to accessing complaints routed to their authorized department.
- **Field Engineers**: Restricted to viewing and modifying complaints actively assigned to their user ID.
- **Administrators**: Governed by `get_auth_user_role() = 'administrator'` for full oversight.
- **Storage Security**: Public read access for verified evidence, authenticated-only upload permissions.

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Populate with your live Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_MAP_PROVIDER=osm
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Execute PostgreSQL Migrations

In your Supabase project's **SQL Editor**:
1. Run `supabase/migrations/01_initial_schema.sql`
2. Run `supabase/seed.sql`

In **Supabase Storage**:
Ensure a public bucket named `civic-evidence` exists (the migration script includes this automatically).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the CivicEye portal.

---

## 🧪 Testing the Complete Workflow

1. **Citizen Flow**:
   - Register at `/register` as **Citizen**.
   - Navigate to `/complaints/new`, choose a category (e.g. *Roads & Potholes*), drag the map pin to set GPS coordinates, attach a photo, and submit.
   - Note the generated human-readable Complaint Reference (e.g., `CE-2026-001001`).

2. **Officer Verification Flow**:
   - Register or sign in as **Department Officer** (select *Roads & Highways Department*).
   - Go to `/officer` to see the new ticket in the verification queue.
   - Click **Manage** → click **Begin Verification** → enter remarks.
   - Click **Assign to Field Engineer**, pick an active engineer, and dispatch.

3. **Field Engineer Resolution Flow**:
   - Register or sign in as **Field Engineer**.
   - Open `/engineer` to view assigned work orders.
   - Click **Execute Work** → **Start Work (In Progress)**.
   - Click **Add Work Photo** to upload progress evidence.
   - Click **Mark Resolved** with completion remarks.

4. **Officer Review & Formal Closure**:
   - Return to the Officer console at `/officer`.
   - The ticket appears under *Awaiting Review*.
   - Click into the complaint, verify resolution photos, and click **Approve & Close Ticket**.

5. **Citizen Notification & Tracking**:
   - The citizen receives real-time notifications via the bell icon and `/notifications`.
   - Anyone can enter `CE-2026-001001` at `/track` to view the completed timeline.
   - Admins can inspect the immutable log at `/admin/audit-logs`.
