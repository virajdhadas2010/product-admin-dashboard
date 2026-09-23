'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Lock, LogIn, Sparkles, User as UserIcon } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/products';
  const isSessionExpired = searchParams.get('expired') === 'true';

  const { login, isAuthenticated } = useAuth();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submit

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login({ username, password });
      router.push(redirectPath);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('Invalid username or password. Please use emilys / emilyspass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('emilys');
    setPassword('emilyspass');
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Card Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Welcome to AdminPulse
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Sign in to manage your products catalog
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 p-7">
        {isSessionExpired && (
          <div className="mb-5 flex items-center gap-2 p-3 text-xs rounded-xl bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            id="username"
            placeholder="e.g. emilys"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
            icon={<UserIcon className="w-4 h-4" />}
            autoComplete="username"
            required
          />

          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Dashboard</span>
          </Button>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200 mb-2">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" /> Demo Credentials
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Username: <strong className="text-slate-700 dark:text-slate-300 font-mono">emilys</strong>
            </p>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
              Password: <strong className="text-slate-700 dark:text-slate-300 font-mono">emilyspass</strong>
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Protected by Nexgensis DummyJSON Auth API
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
