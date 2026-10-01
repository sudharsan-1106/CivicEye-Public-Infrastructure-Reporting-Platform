'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Construction,
  Zap,
  Trash2,
  Droplets,
  Waves,
  Building2,
  TrafficCone,
  AlertCircle,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  FileCheck,
  Calendar,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocationPicker } from '@/components/maps/location-picker';
import { getIssueCategories } from '@/services/admin/admin';
import { createComplaint } from '@/services/complaints/complaints';
import { uploadComplaintEvidence } from '@/lib/storage/evidence';
import { IssueCategory, Priority, Complaint } from '@/types/database';
import { formatDate } from '@/lib/utils';

const STEPS = [
  { id: 1, name: 'Category' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Location' },
  { id: 4, name: 'Evidence' },
  { id: 5, name: 'Review' },
];

function NewComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategoryName = searchParams.get('category');
  const { user, profile, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Uploaded Files State (Local previews before submission)
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    getIssueCategories().then((cats) => {
      setCategories(cats);
      setLoadingCategories(false);

      if (cats.length > 0) {
        if (preselectedCategoryName) {
          const match = cats.find(
            (c) => c.name.toLowerCase() === preselectedCategoryName.toLowerCase()
          );
          if (match) {
            setCategoryId(match.id);
            setDepartmentId(match.department_id);
            setPriority(match.default_priority);
          } else {
            setCategoryId(cats[0].id);
            setDepartmentId(cats[0].department_id);
            setPriority(cats[0].default_priority);
          }
        } else {
          setCategoryId(cats[0].id);
          setDepartmentId(cats[0].department_id);
          setPriority(cats[0].default_priority);
        }
      }
    });
  }, [preselectedCategoryName]);

  const handleSelectCategory = (cat: IssueCategory) => {
    setCategoryId(cat.id);
    setDepartmentId(cat.department_id);
    setPriority(cat.default_priority);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) {
        setErrorMsg(`File ${f.name} exceeds 10MB limit.`);
        continue;
      }
      validFiles.push(f);
      validPreviews.push(URL.createObjectURL(f));
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...validPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Navigations
  const handleNext = () => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!categoryId) {
        setErrorMsg('Please select an issue category.');
        return;
      }
    } else if (currentStep === 2) {
      if (!title.trim() || title.trim().length < 5) {
        setErrorMsg('Please enter a descriptive title (at least 5 characters).');
        return;
      }
      if (!description.trim() || description.trim().length < 15) {
        setErrorMsg('Please enter a detailed description (at least 15 characters).');
        return;
      }
    } else if (currentStep === 3) {
      if (!address.trim() || address.trim().length < 5) {
        setErrorMsg('Please enter or select a valid location address or landmark.');
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitComplaint = async () => {
    if (!user) {
      setErrorMsg('You must be signed in to submit a complaint. Please log in first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSubmissionProgress('Validating complaint data...');

    try {
      setSubmissionProgress('Submitting complaint to municipal registry...');
      const createRes = await createComplaint({
        citizenId: user.id,
        categoryId,
        departmentId,
        title,
        description,
        priority,
        address,
        latitude,
        longitude,
      });

      if (!createRes.success || !createRes.complaint) {
        setErrorMsg(createRes.error || 'Failed to submit complaint.');
        setIsSubmitting(false);
        return;
      }

      const complaint = createRes.complaint;

      if (files.length > 0) {
        setSubmissionProgress(`Uploading ${files.length} evidence photo(s)...`);
        for (let i = 0; i < files.length; i++) {
          await uploadComplaintEvidence({
            complaintId: complaint.id,
            file: files[i],
            evidenceType: 'issue',
            notes: 'Initial issue report photo',
            userId: user.id,
          });
        }
      }

      setSubmissionProgress('Finalizing submission...');
      setCreatedComplaint(complaint);
      setIsSubmitting(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-sm text-slate-500">
          To ensure accountability and provide real-time updates on your complaint, you must sign in
          with your citizen account before reporting an issue.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link href="/login">
            <Button variant="primary">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (createdComplaint) {
    const selectedCat = categories.find((c) => c.id === categoryId);

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
        <Card className="text-center p-6 sm:p-10 border-emerald-200 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Complaint Submitted Successfully</h2>
          <p className="text-sm text-slate-500 mt-1">
            Your grievance has been officially filed with the municipal administration.
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500">Complaint Reference:</span>
              <span className="font-mono font-bold text-sky-700 text-sm tracking-wider">
                {createdComplaint.complaint_reference}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{selectedCat?.name || 'Civic'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Location:</span>
              <span className="font-medium text-slate-800 truncate max-w-[260px]">
                {createdComplaint.address}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Submitted Date:</span>
              <span className="font-medium text-slate-800">
                {formatDate(createdComplaint.created_at)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Current Status:</span>
              <Badge variant="status" value={createdComplaint.status} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/track?ref=${createdComplaint.complaint_reference}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Track Complaint
              </Button>
            </Link>
            <Link href={`/complaints/${createdComplaint.id}`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">
                View Full Details
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  const getCategoryColor = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('road') || lower.includes('pothole')) return { bg: 'bg-amber-500/10 text-amber-700 border-amber-200/80', ring: 'ring-amber-200' };
    if (lower.includes('light') || lower.includes('electr')) return { bg: 'bg-yellow-500/10 text-yellow-700 border-yellow-200/80', ring: 'ring-yellow-200' };
    if (lower.includes('garbag') || lower.includes('sanit')) return { bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80', ring: 'ring-emerald-200' };
    if (lower.includes('water supply') || lower.includes('leak')) return { bg: 'bg-sky-500/10 text-sky-700 border-sky-200/80', ring: 'ring-sky-200' };
    if (lower.includes('drain') || lower.includes('waterlog')) return { bg: 'bg-blue-500/10 text-blue-700 border-blue-200/80', ring: 'ring-blue-200' };
    if (lower.includes('property') || lower.includes('park')) return { bg: 'bg-purple-500/10 text-purple-700 border-purple-200/80', ring: 'ring-purple-200' };
    if (lower.includes('traffic') || lower.includes('signal')) return { bg: 'bg-rose-500/10 text-rose-700 border-rose-200/80', ring: 'ring-rose-200' };
    return { bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200/80', ring: 'ring-indigo-200' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      <div className="ambient-glow glow-cyan w-[400px] h-[400px] -top-10 left-1/4 opacity-30 pointer-events-none" />

      <div className="text-center max-w-xl mx-auto space-y-1 relative z-10">
        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80 uppercase tracking-wider">
          Citizen Reporting Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Report Infrastructure Defect
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Complete the guided steps below to alert the responsible municipal department.
        </p>
      </div>

      <div className="bg-white/95 p-4 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-900/5 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === step.id
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white ring-4 ring-sky-100 shadow-xs'
                      : currentStep > step.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span
                  className={`hidden sm:inline text-xs font-semibold ${
                    currentStep === step.id ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 sm:mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 relative z-10 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {currentStep === 1 && (
        <Card className="relative z-10 border-slate-200/90 bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5">
          <CardHeader>
            <CardTitle className="text-base font-bold">Step 1: Select Infrastructure Category</CardTitle>
            <p className="text-xs text-slate-500">
              Select the category that best matches the issue. This routes your complaint to the
              appropriate municipal department.
            </p>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <div className="flex items-center justify-center p-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2 text-sky-600" />
                <span>Loading municipal categories...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  const colorTheme = getCategoryColor(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-300 shadow-md shadow-sky-500/10'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${colorTheme.bg}`}>
                            {cat.name.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full border border-sky-200/60">
                            {cat.sla_hours}h SLA
                          </span>
                        </div>
                        <span className="font-bold text-sm text-slate-900 block">{cat.name}</span>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1.5">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 2: Complaint Details</CardTitle>
            <p className="text-xs text-slate-500">
              Provide specific information to help field engineers understand and assess the defect.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Complaint Title / Summary"
              required
              placeholder="e.g. Deep pothole on North Main Rd near Metro Pillar 42"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Brief summary identifying the defect and primary location."
            />

            <Textarea
              label="Detailed Description"
              required
              rows={5}
              placeholder="Describe the severity, duration, and safety hazards."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="Min 15 characters. Be as precise as possible."
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Urgency / Priority</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      priority === p
                        ? 'border-sky-600 bg-sky-50 text-sky-800 ring-2 ring-sky-200'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 3: Incident Location</CardTitle>
            <p className="text-xs text-slate-500">
              Enter the street address, landmark, or click on the map to place an accurate GPS marker.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address or Landmark"
              required
              placeholder="e.g. Cross Road 4, Sector 12, near Municipal Water Tank"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="pt-2">
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                address={address}
                onChange={({ latitude: lat, longitude: lng, address: addr }) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  if (addr) setAddress(addr);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 4: Evidence Photos</CardTitle>
            <p className="text-xs text-slate-500">
              Photographic evidence speeds up officer verification and ensures rapid engineer dispatch.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-sky-500 hover:bg-sky-50/20 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-semibold text-slate-700">
                Click to browse or drag photos here
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Attach clear pictures showing the defect and surroundings
              </span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {filePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {filePreviews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                  >
                    <img src={src} alt="Evidence preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="absolute top-1 right-1 p-1 bg-slate-900/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 5: Review & Confirm Submission</CardTitle>
            <p className="text-xs text-slate-500">
              Please inspect the grievance details before submitting to the municipal registry.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="text-slate-900 font-semibold text-sm">
                  {selectedCategoryObj?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Target Priority</span>
                <Badge variant="priority" value={priority} />
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">Title</span>
                <span className="text-slate-900 font-semibold">{title}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">Description</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line mt-0.5">
                  {description}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">Location</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>{address}</span>
                </div>
                {latitude && longitude && (
                  <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                    Coordinates: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-medium">Evidence Photos Attached</span>
                <span className="text-slate-800 font-medium">
                  {files.length} photo(s) selected
                </span>
              </div>
            </div>

            {isSubmitting && (
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-sky-600" />
                <span>{submissionProgress}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 5 ? (
          <Button type="button" variant="primary" onClick={handleNext}>
            Continue
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="success"
            onClick={handleSubmitComplaint}
            isLoading={isSubmitting}
            size="lg"
          >
            Submit Complaint
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewComplaintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <NewComplaintContent />
    </Suspense>
  );
}
