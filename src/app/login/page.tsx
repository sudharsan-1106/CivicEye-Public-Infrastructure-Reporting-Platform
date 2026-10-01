'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema } from '@/lib/validation/schemas';
import { SupabaseSetupBanner } from '@/components/ui/supabase-banner';

export default function LoginPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = loginSchema.safeParse({ email, password });
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        await refreshProfile();

        const role = profileData?.role || 'citizen';
        switch (role) {
          case 'administrator':
            router.push('/admin');
            break;
          case 'department_officer':
            router.push('/officer');
            break;
          case 'field_engineer':
            router.push('/engineer');
            break;
          default:
            router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected login error occurred.';
      if (message.includes('fetch') || message.includes('Failed to fetch')) {
        setErrorMsg(
          'Unable to reach Supabase API (Failed to fetch). Please check NEXT_PUBLIC_SUPABASE_URL in .env.local.'
        );
      } else {
        setErrorMsg(message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-glow glow-cyan w-[450px] h-[450px] -top-10 left-10 opacity-30 pointer-events-none" />
      <div className="ambient-glow glow-indigo w-[400px] h-[400px] bottom-0 right-10 opacity-25 pointer-events-none" />

      <div className="max-w-md w-full space-y-6 bg-white/95 p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-xl relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 items-center justify-center text-white mb-2 shadow-md shadow-sky-500/25">
            <Eye className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to CivicEye
          </h2>
          <p className="text-xs text-slate-500">
            Access citizen reporting, department queue, or engineering console
          </p>
        </div>

        <SupabaseSetupBanner />

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            autoComplete="email"
            placeholder="citizen@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full mt-2 shadow-md shadow-sky-500/20" isLoading={loading}>
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{' '}
          <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
