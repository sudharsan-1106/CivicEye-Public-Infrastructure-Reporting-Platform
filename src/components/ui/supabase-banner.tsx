'use client';

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Database, ExternalLink, Key, Check } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/status';

export function SupabaseSetupBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const configured = isSupabaseConfigured();

  if (configured) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-200 text-amber-900">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-amber-950 text-sm">
              Real Supabase Credentials Required
            </h4>
            <p className="text-amber-800 text-[11px] mt-0.5">
              CivicEye enforces real PostgreSQL authentication & RLS policies (no mock data).
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-amber-700 hover:text-amber-950 p-1"
          aria-label="Toggle instructions"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2.5">
          <p className="text-slate-700">
            To register accounts and save complaints, connect your free Supabase project:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-800 font-medium">
            <li>
              Create a free project at{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="underline text-sky-700 font-bold inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              In your Supabase project dashboard, navigate to <strong>Project Settings → API</strong>.
            </li>
            <li>
              In your project root <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">.env.local</code>, replace the placeholder URL and Anon Key:
              <div className="mt-1 bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] select-all overflow-x-auto">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...<br />
                SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
              </div>
            </li>
            <li>
              In Supabase <strong>SQL Editor</strong>, execute:
              <ul className="list-disc list-inside pl-4 pt-1 font-normal text-slate-700">
                <li><code className="font-mono text-[11px]">supabase/migrations/01_initial_schema.sql</code> (Schema & RLS)</li>
                <li><code className="font-mono text-[11px]">supabase/seed.sql</code> (Departments & Categories)</li>
              </ul>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
