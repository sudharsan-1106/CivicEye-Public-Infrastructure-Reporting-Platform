'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  User,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Upload,
  Camera,
  FileText,
  UserCheck,
  Send,
  Loader2,
  Shield,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { getComplaintById } from '@/services/complaints/complaints';
import { executeWorkflowTransition } from '@/services/complaints/workflow';
import { uploadComplaintEvidence } from '@/lib/storage/evidence';
import { getFieldEngineers } from '@/services/admin/admin';
import { Complaint, ComplaintStatus, Profile, Priority } from '@/types/database';
import { formatDate, formatRelativeTime, formatStatusLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MapViewer } from '@/components/maps/map-viewer';

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, profile, role } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workflow action modal states
  const [activeModal, setActiveModal] = useState<
    'verify' | 'reject' | 'assign' | 'start_work' | 'resolve' | 'close' | 'upload_evidence' | null
  >(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');
  const [selectedEngineerId, setSelectedEngineerId] = useState('');
  const [engineersList, setEngineersList] = useState<Profile[]>([]);

  // Evidence upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadType, setUploadType] = useState<'issue' | 'progress' | 'resolution'>('progress');

  const loadData = async () => {
    setLoading(true);
    const res = await getComplaintById(id);
    if (res.data) {
      setComplaint(res.data);
      // If officer, load field engineers in the same department
      if (res.data.department_id) {
        getFieldEngineers(res.data.department_id).then(setEngineersList);
      } else {
        getFieldEngineers().then(setEngineersList);
      }
    } else {
      setErrorMsg(res.error || 'Complaint not found.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleExecuteWorkflow = async (newStatus: ComplaintStatus, engineerId?: string) => {
    if (!user || !complaint) return;
    setActionLoading(true);
    setErrorMsg(null);

    const res = await executeWorkflowTransition({
      complaintId: complaint.id,
      currentStatus: complaint.status,
      newStatus,
      userId: user.id,
      userRole: role || 'citizen',
      remarks: actionRemarks,
      engineerId: engineerId || (newStatus === 'ASSIGNED' ? selectedEngineerId : undefined),
    });

    if (res.success) {
      setActiveModal(null);
      setActionRemarks('');
      await loadData();
    } else {
      setErrorMsg(res.error || 'Failed to update complaint status.');
    }
    setActionLoading(false);
  };

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !user || !complaint) return;
    setActionLoading(true);

    const res = await uploadComplaintEvidence({
      complaintId: complaint.id,
      file: uploadFile,
      evidenceType: uploadType,
      notes: uploadNotes,
      userId: user.id,
    });

    if (res.success) {
      setActiveModal(null);
      setUploadFile(null);
      setUploadNotes('');
      await loadData();
    } else {
      setErrorMsg(res.error || 'Evidence upload failed.');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        <span className="text-xs text-slate-500 font-medium">Loading complaint record...</span>
      </div>
    );
  }

  if (errorMsg && !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">{errorMsg}</p>
        <Link href="/track">
          <Button variant="outline" size="sm">
            Search Another Complaint
          </Button>
        </Link>
      </div>
    );
  }

  if (!complaint) return null;

  const activeAssignment = complaint.assignments?.find((a) => a.status === 'ACTIVE');
  const isAssignedEngineer = user && activeAssignment?.engineer_id === user.id;
  const isOfficerOrAdmin = role === 'department_officer' || role === 'administrator';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      <div className="ambient-glow glow-cyan w-[400px] h-[400px] -top-10 left-10 opacity-25 pointer-events-none" />

      {/* Top Banner / Reference Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 bg-white/95 rounded-3xl border border-slate-200/90 shadow-md shadow-slate-900/5 backdrop-blur-md">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono font-bold text-sky-700 text-lg bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200/60">
              {complaint.complaint_reference}
            </span>
            <Badge variant="status" value={complaint.status} />
            <Badge variant="priority" value={complaint.priority} />
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
              {complaint.category?.name || 'Civic'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{complaint.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Filed on {formatDate(complaint.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Reported by {complaint.citizen?.full_name || 'Citizen'}
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              {complaint.department?.name || 'Department Unassigned'}
            </span>
          </div>
        </div>

        {/* Action Buttons based on User Role & Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Officer Verification Actions */}
          {isOfficerOrAdmin && complaint.status === 'SUBMITTED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveModal('verify')}
            >
              <UserCheck className="w-4 h-4 mr-1.5" />
              Begin Verification
            </Button>
          )}

          {isOfficerOrAdmin && complaint.status === 'UNDER_VERIFICATION' && (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setActiveModal('reject')}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveModal('assign')}
              >
                <UserCheck className="w-4 h-4 mr-1.5" />
                Assign to Field Engineer
              </Button>
            </>
          )}

          {/* Engineer Actions */}
          {(isAssignedEngineer || role === 'administrator') &&
            complaint.status === 'ASSIGNED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveModal('start_work')}
              >
                <Clock className="w-4 h-4 mr-1.5" />
                Start Work (In Progress)
              </Button>
            )}

          {(isAssignedEngineer || role === 'administrator') &&
            complaint.status === 'IN_PROGRESS' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadType('progress');
                    setActiveModal('upload_evidence');
                  }}
                >
                  <Camera className="w-4 h-4 mr-1.5" />
                  Add Work Photo
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setActiveModal('resolve')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark Resolved
                </Button>
              </>
            )}

          {/* Officer Closure Action */}
          {isOfficerOrAdmin && complaint.status === 'RESOLVED' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setActiveModal('close')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Approve & Close Ticket
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Details & Evidence (Left 8 cols) + Timeline & Assignment (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Detailed Description */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">Grievance Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>

              {/* Special status callouts */}
              {complaint.rejection_reason && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <span className="font-semibold block mb-1">Rejection Remarks:</span>
                  <p className="leading-relaxed">{complaint.rejection_reason}</p>
                </div>
              )}

              {complaint.verification_remarks && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <span className="font-semibold block mb-1">Officer Verification Remarks:</span>
                  <p className="leading-relaxed">{complaint.verification_remarks}</p>
                </div>
              )}

              {complaint.resolution_notes && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <span className="font-semibold block mb-1">Resolution Summary:</span>
                  <p className="leading-relaxed">{complaint.resolution_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evidence Gallery */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Photographic Evidence</CardTitle>
              {user && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUploadType('progress');
                    setActiveModal('upload_evidence');
                  }}
                  className="text-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload Evidence
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {complaint.evidence && complaint.evidence.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.evidence.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-200">
                        <img
                          src={item.file_url}
                          alt={item.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                          {item.evidence_type}
                        </span>
                      </div>
                      <div className="p-3 text-xs space-y-1">
                        <p className="font-medium text-slate-800 truncate">{item.file_name}</p>
                        {item.notes && (
                          <p className="text-slate-500 line-clamp-1 italic">{item.notes}</p>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          Uploaded {formatRelativeTime(item.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  No photographic evidence attached yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location & Map */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base">Incident Location</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{complaint.address}</span>
              </div>
              {complaint.latitude && complaint.longitude ? (
                <MapViewer
                  latitude={complaint.latitude}
                  longitude={complaint.longitude}
                  address={complaint.address}
                  className="w-full h-64 rounded-xl"
                />
              ) : (
                <div className="h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Exact GPS coordinates not recorded
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow Timeline & Assignment Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assignment Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm">Assigned Personnel</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3">
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="text-slate-800 font-semibold">
                  {complaint.department?.name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Field Engineer</span>
                {activeAssignment?.engineer ? (
                  <div className="mt-1 p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900">
                    <span className="font-bold block">{activeAssignment.engineer.full_name}</span>
                    <span className="text-[11px] text-purple-700 block">
                      {activeAssignment.engineer.email}
                    </span>
                    {activeAssignment.instructions && (
                      <p className="mt-2 text-[11px] text-purple-800 border-t border-purple-200 pt-1">
                        Instructions: {activeAssignment.instructions}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 italic">No engineer assigned yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm">Redressal Status History</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {complaint.status_history && complaint.status_history.length > 0 ? (
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-2">
                  {complaint.status_history.map((hist, idx) => (
                    <div key={hist.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-200" />
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{formatStatusLabel(hist.new_status)}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          {formatDate(hist.created_at)}
                        </span>
                        {hist.remarks && (
                          <p className="text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100 text-[11px] leading-relaxed">
                            {hist.remarks}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          By: {hist.changer?.full_name || 'System'} ({hist.changer?.role || 'staff'})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400">No status transitions recorded yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= MODALS FOR WORKFLOW TRANSITIONS ================= */}

      {/* 1. Verify Modal */}
      <Modal
        isOpen={activeModal === 'verify'}
        onClose={() => setActiveModal(null)}
        title="Verify Complaint"
        description="Acknowledge and mark complaint as verified and ready for field assignment."
      >
        <div className="space-y-4">
          <Textarea
            label="Verification Remarks"
            required
            placeholder="e.g. Issue confirmed via municipal inspection checklist. Severity verified as high."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={actionLoading}
              onClick={() => handleExecuteWorkflow('UNDER_VERIFICATION')}
            >
              Confirm Verification
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Reject Modal */}
      <Modal
        isOpen={activeModal === 'reject'}
        onClose={() => setActiveModal(null)}
        title="Reject Complaint"
        description="Specify the administrative or jurisdictional reason for rejecting this report."
      >
        <div className="space-y-4">
          <Textarea
            label="Rejection Reason"
            required
            placeholder="e.g. Duplicate report of CE-2026-000940, or located on private property outside municipal jurisdiction."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={actionLoading}
              onClick={() => handleExecuteWorkflow('REJECTED')}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Assign Modal */}
      <Modal
        isOpen={activeModal === 'assign'}
        onClose={() => setActiveModal(null)}
        title="Assign to Field Engineer"
        description="Dispatch an authorized departmental field engineer to inspect and repair."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Select Field Engineer</label>
            <select
              value={selectedEngineerId}
              onChange={(e) => setSelectedEngineerId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
              required
            >
              <option value="">-- Choose active engineer --</option>
              {engineersList.map((eng) => (
                <option key={eng.id} value={eng.id}>
                  {eng.full_name} ({eng.email})
                </option>
              ))}
            </select>
          </div>
          <Textarea
            label="Work Instructions"
            placeholder="e.g. Conduct asphalt cold-mix patching within 24 hours. Ensure safety cones are placed."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!selectedEngineerId}
              isLoading={actionLoading}
              onClick={() => handleExecuteWorkflow('ASSIGNED', selectedEngineerId)}
            >
              Dispatch Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Start Work Modal */}
      <Modal
        isOpen={activeModal === 'start_work'}
        onClose={() => setActiveModal(null)}
        title="Commence Work"
        description="Transition ticket to In Progress state to inform the citizen and department officer."
      >
        <div className="space-y-4">
          <Textarea
            label="Commencement Remarks"
            required
            placeholder="e.g. Field repair crew deployed with materials to incident location."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={actionLoading}
              onClick={() => handleExecuteWorkflow('IN_PROGRESS')}
            >
              Start Work
            </Button>
          </div>
        </div>
      </Modal>

      {/* 5. Resolve Modal */}
      <Modal
        isOpen={activeModal === 'resolve'}
        onClose={() => setActiveModal(null)}
        title="Mark Defect as Resolved"
        description="Certify that repair work has been physically completed in the field."
      >
        <div className="space-y-4">
          <Textarea
            label="Resolution Summary Notes"
            required
            placeholder="e.g. Pothole cleared, aggregate compacted, and high-grade asphalt sealed. Traffic restored safely."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              isLoading={actionLoading}
              onClick={() => handleExecuteWorkflow('RESOLVED')}
            >
              Submit Resolution
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. Close Modal */}
      <Modal
        isOpen={activeModal === 'close'}
        onClose={() => setActiveModal(null)}
        title="Approve & Close Complaint"
        description="Verify engineer resolution evidence and formally close the municipal ticket."
      >
        <div className="space-y-4">
          <Textarea
            label="Closing Audit Remarks"
            required
            placeholder="e.g. Resolution evidence verified and meets municipal road maintenance standards. Ticket officially closed."
            value={actionRemarks}
            onChange={(e) => setActionRemarks(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              isLoading={actionLoading}
              onClick={() => handleExecuteWorkflow('CLOSED')}
            >
              Formally Close Ticket
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. Upload Evidence Modal */}
      <Modal
        isOpen={activeModal === 'upload_evidence'}
        onClose={() => setActiveModal(null)}
        title="Upload Work Evidence"
        description="Attach photographs documenting ongoing repair or completed resolution."
      >
        <form onSubmit={handleUploadEvidence} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Evidence Category</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm"
            >
              <option value="progress">Work Progress Photo</option>
              <option value="resolution">Final Resolution Evidence (Completed Repair)</option>
              <option value="issue">Original Defect Photo</option>
            </select>
          </div>

          <Input
            type="file"
            label="Photo File"
            required
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
          />

          <Input
            label="Description / Caption"
            placeholder="e.g. After asphalt steam-rolling"
            value={uploadNotes}
            onChange={(e) => setUploadNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading} disabled={!uploadFile}>
              Upload Evidence
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
