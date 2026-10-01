'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getComplaintById } from '@/services/complaints/complaints';
import { Complaint, ComplaintStatus } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { MapViewer } from '@/components/maps/map-viewer';

const LIFECYCLE_STEPS: { status: ComplaintStatus; label: string }[] = [
  { status: 'SUBMITTED', label: 'Submitted' },
  { status: 'UNDER_VERIFICATION', label: 'Verification' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'RESOLVED', label: 'Resolved' },
  { status: 'CLOSED', label: 'Closed' },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const [refInput, setRefInput] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchComplaint = async (reference: string) => {
    if (!reference.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setComplaint(null);

    const result = await getComplaintById(reference.trim());
    if (result.data) {
      setComplaint(result.data);
    } else {
      setErrorMsg(
        `No complaint record found matching reference "${reference}". Please verify the complaint ID.`
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialRef) {
      fetchComplaint(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(refInput);
  };

  const getStepState = (stepStatus: ComplaintStatus, currentStatus: ComplaintStatus) => {
    if (currentStatus === 'REJECTED') {
      return stepStatus === 'SUBMITTED' ? 'complete' : 'disabled';
    }

    const order: ComplaintStatus[] = [
      'SUBMITTED',
      'UNDER_VERIFICATION',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'CLOSED',
    ];

    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      <div className="ambient-glow glow-cyan w-[450px] h-[450px] -top-20 left-10 opacity-30 pointer-events-none" />
      <div className="ambient-glow glow-indigo w-[400px] h-[400px] top-40 right-0 opacity-25 pointer-events-none" />

      <div className="text-center max-w-xl mx-auto space-y-2 relative z-10">
        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80 uppercase tracking-wider">
          Public Redressal Verification
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
          Track Public Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Enter your unique complaint reference number (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono font-semibold">CE-2026-001001</code>) to view real-time
          investigation and resolution status.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-md shadow-slate-900/5 relative z-10 border-slate-200/90 bg-white/95 backdrop-blur-md">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter Reference (CE-YYYY-XXXXXX)"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value.toUpperCase())}
                className="font-mono text-sm tracking-wider uppercase font-medium bg-slate-50/50"
                required
              />
            </div>
            <Button type="submit" variant="gradient" isLoading={loading} className="shrink-0 shadow-xs shadow-sky-500/20">
              <Search className="w-4 h-4 mr-1.5" />
              Check Status
            </Button>
          </form>
        </CardContent>
      </Card>

      {errorMsg && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3 relative z-10 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {complaint && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-sky-700 text-base">
                  {complaint.complaint_reference}
                </span>
                <Badge variant="status" value={complaint.status} />
                <Badge variant="priority" value={complaint.priority} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{complaint.title}</h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on {formatDate(complaint.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/complaints/${complaint.id}`}>
                <Button variant="outline" size="sm">
                  View Full Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm">Redressal Lifecycle Tracker</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {complaint.status === 'REJECTED' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                  <div className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Complaint Rejected during Verification
                  </div>
                  {complaint.rejection_reason && (
                    <p className="mt-2 text-xs text-rose-700">
                      Officer remarks: {complaint.rejection_reason}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const state = getStepState(step.status, complaint.status);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                          state === 'complete'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                            : state === 'current'
                            ? 'bg-sky-50 border-sky-400 text-sky-800 ring-2 ring-sky-200 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                            state === 'complete'
                              ? 'bg-emerald-600 text-white'
                              : state === 'current'
                              ? 'bg-sky-600 text-white animate-pulse'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {state === 'complete' ? '✓' : idx + 1}
                        </div>
                        <span className="text-xs font-semibold">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm">Complaint Overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Category</span>
                  <span className="text-slate-800 font-semibold text-sm">
                    {complaint.category?.name || 'General Civic'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Department</span>
                  <span className="text-slate-800 font-medium">
                    {complaint.department?.name || 'Pending Department Routing'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Description</span>
                  <p className="text-slate-700 mt-1 leading-relaxed whitespace-pre-line">
                    {complaint.description}
                  </p>
                </div>
                {complaint.resolution_notes && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="font-semibold block mb-1">Field Resolution Notes:</span>
                    <p className="leading-relaxed">{complaint.resolution_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm">Location</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-2 text-xs text-slate-700">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{complaint.address}</span>
                </div>
                {complaint.latitude && complaint.longitude ? (
                  <MapViewer
                    latitude={complaint.latitude}
                    longitude={complaint.longitude}
                    address={complaint.address}
                    className="w-full h-44 rounded-lg"
                  />
                ) : (
                  <div className="h-32 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    Coordinates not tagged
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
