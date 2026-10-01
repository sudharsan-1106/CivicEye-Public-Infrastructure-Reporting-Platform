import React from 'react';
import Link from 'next/link';
import { Eye, Shield, PhoneCall, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/90 backdrop-blur-md text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/25">
                <Eye className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Civic<span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Eye</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              The official centralized municipal public infrastructure reporting and grievance
              redressal platform connecting citizens with municipal departments.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Municipal Dispatch Grid Online
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/complaints/new" className="hover:text-sky-600 transition-colors">
                  Report Infrastructure Issue
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-sky-600 transition-colors">
                  Track Complaint by Reference
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-sky-600 transition-colors">
                  Officer & Engineer Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-sky-600 transition-colors">
                  Administrative Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Municipal Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Roads & Highways Department</li>
              <li>Electrical & Public Lighting</li>
              <li>Sanitation & Solid Waste</li>
              <li>Water Supply & Sewerage Board</li>
              <li>Public Works & Property</li>
              <li>Traffic Infrastructure & Signals</li>
            </ul>
          </div>

          {/* Emergency & Municipal Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Emergency Civics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>24/7 Civic Helpline: 1800-CIVIC-EYE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>grievances@civiceye.gov</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>Municipal Corporation Headquarters, Civic Center</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CivicEye System. Built for Public Transparency.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              Role-Based Access Protected
            </span>
            <span>PostgreSQL · Supabase RLS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
