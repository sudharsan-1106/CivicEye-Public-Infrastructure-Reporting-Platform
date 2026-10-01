'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema } from '@/lib/validation/schemas';
import { getDepartments } from '@/services/admin/admin';
import { Department, UserRole } from '@/types/database';
import { SupabaseSetupBanner } from '@/components/ui/supabase-banner';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) {
        setDepartmentId(depts[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = registerSchema.safeParse({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      role,
      departmentId: role === 'citizen' ? null : departmentId || null,
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMsg(
        'Supabase credentials are not connected yet. Please update .env.local with your real Supabase Project URL and Anon Key (see instructions above).'
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        if (role !== 'citizen' && departmentId) {
          await supabase
            .from('profiles')
            .update({ department_id: departmentId })
            .eq('id', data.user.id);
        }

        setSuccessMsg(
          'Account registered successfully! Redirecting to login portal...'
        );
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      if (msg.includes('fetch') || msg.includes('Failed to fetch')) {
        setErrorMsg(
          'Unable to reach Supabase API (Failed to fetch). Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local points to a valid, live Supabase project.'
        );
      } else {
        setErrorMsg(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-glow glow-cyan w-[450px] h-[450px] -top-10 left-10 opacity-30 pointer-events-none" />
      <div className="ambient-glow glow-indigo w-[400px] h-[400px] bottom-0 right-10 opacity-25 pointer-events-none" />

      <div className="max-w-lg w-full space-y-6 bg-white/95 p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-xl relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 items-center justify-center text-white mb-2 shadow-md shadow-sky-500/25">
            <Eye className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Register as a citizen or municipal staff member
          </p>
        </div>

        {/* Supabase configuration guide when placeholder credentials are detected */}
        <SupabaseSetupBanner />

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1-555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="citizen">Citizen (Report & Track Issues)</option>
              <option value="department_officer">Department Officer (Verify & Assign)</option>
              <option value="field_engineer">Field Engineer (Repair & Resolve)</option>
              <option value="administrator">Administrator (Full Control)</option>
            </select>
          </div>

          {(role === 'department_officer' || role === 'field_engineer') && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Assigned Municipal Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full mt-2 shadow-md shadow-sky-500/20" isLoading={loading}>
            Create Account
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
