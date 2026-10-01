'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Activity,
  Zap,
  Trash2,
  Droplets,
  Construction,
  Waves,
  Building2,
  TrafficCone,
  ShieldCheck,
  Users,
  ChevronRight,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  {
    icon: Construction,
    name: 'Roads & Potholes',
    desc: 'Report cratered asphalt, missing manhole covers, curb damage, and broken pavements.',
    sla: '48h SLA',
    color: 'text-amber-600 bg-amber-500/10 border-amber-200/60 dark:text-amber-400 dark:bg-amber-950/40',
    glow: 'hover:border-amber-400/80 hover:shadow-amber-500/10',
  },
  {
    icon: Zap,
    name: 'Streetlight Failures',
    desc: 'Faulty bulbs, dark intersections, sparking wiring, or leaning utility poles.',
    sla: '24h SLA',
    color: 'text-yellow-600 bg-yellow-500/10 border-yellow-200/60 dark:text-yellow-400 dark:bg-yellow-950/40',
    glow: 'hover:border-yellow-400/80 hover:shadow-yellow-500/10',
  },
  {
    icon: Trash2,
    name: 'Garbage & Sanitation',
    desc: 'Overflowing dumpsters, open municipal waste dumps, and uncollected neighborhood trash.',
    sla: '24h SLA',
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-200/60 dark:text-emerald-400 dark:bg-emerald-950/40',
    glow: 'hover:border-emerald-400/80 hover:shadow-emerald-500/10',
  },
  {
    icon: Droplets,
    name: 'Water Supply & Leakage',
    desc: 'Burst municipal water lines, contaminated drinking water supply, and low water pressure.',
    sla: '36h SLA',
    color: 'text-sky-600 bg-sky-500/10 border-sky-200/60 dark:text-sky-400 dark:bg-sky-950/40',
    glow: 'hover:border-sky-400/80 hover:shadow-sky-500/10',
  },
  {
    icon: Waves,
    name: 'Drainage & Waterlogging',
    desc: 'Flooded streets, choked monsoon culverts, backed up sewer lines, and missing drains.',
    sla: '12h SLA',
    color: 'text-blue-600 bg-blue-500/10 border-blue-200/60 dark:text-blue-400 dark:bg-blue-950/40',
    glow: 'hover:border-blue-400/80 hover:shadow-blue-500/10',
  },
  {
    icon: Building2,
    name: 'Public Property Damage',
    desc: 'Vandalized bus shelters, broken park equipment, collapsed boundaries, and public signage.',
    sla: '96h SLA',
    color: 'text-purple-600 bg-purple-500/10 border-purple-200/60 dark:text-purple-400 dark:bg-purple-950/40',
    glow: 'hover:border-purple-400/80 hover:shadow-purple-500/10',
  },
  {
    icon: TrafficCone,
    name: 'Traffic Infrastructure',
    desc: 'Malfunctioning signals, damaged speed humps, missing pedestrian crossing signs.',
    sla: '24h SLA',
    color: 'text-rose-600 bg-rose-500/10 border-rose-200/60 dark:text-rose-400 dark:bg-rose-950/40',
    glow: 'hover:border-rose-400/80 hover:shadow-rose-500/10',
  },
  {
    icon: ShieldAlert,
    name: 'General Public Hazards',
    desc: 'All other immediate civic infrastructure hazards requiring department inspection.',
    sla: '72h SLA',
    color: 'text-indigo-600 bg-indigo-500/10 border-indigo-200/60 dark:text-indigo-400 dark:bg-indigo-950/40',
    glow: 'hover:border-indigo-400/80 hover:shadow-indigo-500/10',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [trackRef, setTrackRef] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef.trim()) return;
    router.push(`/track?ref=${encodeURIComponent(trackRef.trim().toUpperCase())}`);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50/50">
      {/* Background Ambient Glow Elements */}
      <div className="ambient-glow glow-cyan w-[500px] h-[500px] -top-32 left-1/4 -translate-x-1/2" />
      <div className="ambient-glow glow-indigo w-[600px] h-[600px] top-10 right-0" />
      <div className="ambient-glow glow-emerald w-[400px] h-[400px] top-[600px] left-10 opacity-40" />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-sky-200/80 text-sky-800 text-xs font-semibold tracking-wide uppercase shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Unified Municipal Redressal Architecture
              <span className="text-sky-300">·</span>
              <span className="text-sky-600 font-bold lowercase tracking-normal">24/7 active</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Report. Track.{' '}
              <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Resolve.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              CivicEye empowers citizens to report civic infrastructure defects directly to municipal
              departments, with transparent tracking from initial verification to field resolution.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link href="/complaints/new" className="w-full sm:w-auto">
                <Button size="lg" variant="gradient" className="w-full sm:w-auto shadow-lg shadow-sky-500/25">
                  Report Infrastructure Issue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/track" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm hover:bg-white shadow-2xs">
                  <Search className="w-4 h-4 mr-2 text-slate-500" />
                  Track Existing Complaint
                </Button>
              </Link>
            </div>

            {/* Fast Track Input Box */}
            <div className="pt-6 max-w-lg mx-auto">
              <form
                onSubmit={handleTrackSubmit}
                className="flex items-center gap-2 p-2 bg-white/95 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/90 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all backdrop-blur-md"
              >
                <div className="pl-3 text-sky-600">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Enter Complaint ID (e.g. CE-2026-001001)"
                  value={trackRef}
                  onChange={(e) => setTrackRef(e.target.value)}
                  className="flex-1 text-sm bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-slate-900 uppercase font-mono tracking-wider font-medium"
                />
                <Button type="submit" size="sm" variant="primary" className="rounded-xl px-4">
                  Track Status
                </Button>
              </form>
            </div>

            {/* Live Infrastructure Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200/60 mt-10">
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">100%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Verified Proof</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-extrabold text-sky-600 tracking-tight">&lt; 24h</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Average Response</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 tracking-tight">6 Units</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Municipal Depts</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs backdrop-blur-xs">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">Realtime</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Status Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW PIPELINE: HOW CIVICEYE WORKS */}
      <section className="relative z-10 py-16 sm:py-24 bg-white/70 backdrop-blur-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
              Audit-Ready Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Strict 7-Step Redressal Lifecycle
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every complaint follows an auditable, role-authorized governance workflow with zero ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-sky-300 transition-all duration-300 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Citizen Reports</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Upload photos, select category, pinpoint GPS coordinates, and submit with instant reference ID.
              </p>
            </div>

            <div className="group bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-purple-300 transition-all duration-300 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm shadow-purple-500/20 group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Officer Verification</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Department Officer evaluates validity, verifies evidence, and assigns to an authorized Field Engineer.
              </p>
            </div>

            <div className="group bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-300 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Field Work & Evidence</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Engineer conducts physical repair, posts progress updates, and submits post-repair resolution images.
              </p>
            </div>

            <div className="group bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm mb-5 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Review & Closure</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Officer reviews verified resolution proof, formally closes the ticket, and updates the citizen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ISSUE CATEGORIES GRID */}
      <section className="relative z-10 py-16 sm:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200/60">
                Municipal Jurisdiction
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Report By Infrastructure Category
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Routed automatically to the corresponding civic engineering department.
              </p>
            </div>
            <Link
              href="/complaints/new"
              className="mt-4 md:mt-0 text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
            >
              Start a new report <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className={`group p-6 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${cat.glow}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl border ${cat.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/60">
                        {cat.sla}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-5 border-t border-slate-100">
                    <Link
                      href={`/complaints/new?category=${encodeURIComponent(cat.name)}`}
                      className="text-xs font-semibold text-sky-600 flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Report this issue <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY CIVICEYE & TRUST FEATURES */}
      <section className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800/60">
              Accountability by Design
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              Engineered for Public Transparency
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No black-box complaints. CivicEye brings municipal engineering workflows directly into public view.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm hover:border-sky-500/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-5 border border-sky-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">GPS Location Precision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pinpoint issue locations using interactive maps or device GPS to eliminate ambiguity for field crews.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm hover:border-emerald-500/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Dual Evidence Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mandatory resolution evidence upload ensures issues are resolved with photographic before & after proof.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm hover:border-purple-500/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Immutable Status History</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every transition, rejection reason, assignment, and officer remark is timestamped and recorded permanently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative z-10 py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 p-8 sm:p-14 text-white shadow-2xl shadow-indigo-900/20 text-center space-y-6 relative overflow-hidden">
            {/* Soft decorative elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight relative z-10">
              Notice a problem in your street or neighborhood?
            </h2>
            <p className="text-sm sm:text-base text-sky-100 max-w-xl mx-auto leading-relaxed relative z-10">
              Help your municipal corporation maintain clean, safe, and reliable public infrastructure. It takes under 60 seconds to file a report.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
              <Link href="/complaints/new" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-black/10 font-bold border-none">
                  Submit a Complaint Now
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="glass" className="w-full sm:w-auto font-semibold">
                  Staff Login Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
