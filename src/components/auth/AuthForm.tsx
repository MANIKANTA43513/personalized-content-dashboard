'use client';

import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLoginMutation, useSignupMutation } from '@/services/api/contentApi';
import { useAppDispatch } from '@/store/hooks';
import { signedIn } from '@/store/slices/authSlice';
import type { ApiError } from '@/types/content';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, loginState] = useLoginMutation();
  const [signup, signupState] = useSignupMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const ids = { name: useId(), email: useId(), password: useId() };
  const busy = loginState.isLoading || signupState.isLoading;
  const isLogin = mode === 'login';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = isLogin ? await login({ email, password }).unwrap() : await signup({ name, email, password }).unwrap();
      dispatch(signedIn(res.user));
      router.replace('/dashboard');
    } catch (err) {
      setError((err as ApiError | undefined)?.message ?? t('error.generic'));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4 flex items-center gap-2"><LanguageSwitcher /><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink"><Activity className="h-5 w-5" aria-hidden="true" /></span>
          <span className="font-display text-2xl font-semibold">Pulse</span>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8" noValidate>
          <div>
            <h1 className="text-2xl font-semibold">{isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}</h1>
            <p className="mt-1 text-sm text-muted">{isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}</p>
          </div>

          {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" data-testid="auth-error">{error}</p>}

          {!isLogin && (
            <div>
              <label htmlFor={ids.name} className="mb-1.5 block text-sm font-medium">{t('auth.name')}</label>
              <input id={ids.name} className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </div>
          )}
          <div>
            <label htmlFor={ids.email} className="mb-1.5 block text-sm font-medium">{t('auth.email')}</label>
            <input id={ids.email} type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div>
            <label htmlFor={ids.password} className="mb-1.5 block text-sm font-medium">{t('auth.password')}</label>
            <input id={ids.password} type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={8} aria-describedby={isLogin ? undefined : `${ids.password}-hint`} />
            {!isLogin && <p id={`${ids.password}-hint`} className="mt-1.5 text-xs text-muted">{t('auth.passwordHint')}</p>}
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={busy} data-testid="auth-submit">
            {busy ? t('common.loading') : isLogin ? t('auth.login') : t('auth.signup')}
          </button>

          {isLogin && (
            <button type="button" className="btn-secondary w-full" data-testid="use-demo" onClick={() => { setEmail('demo@pulse.dev'); setPassword('Demo@1234'); }}>
              {t('auth.useDemo')}
            </button>
          )}

          <p className="text-center text-sm text-muted">
            {isLogin ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <Link href={isLogin ? '/signup' : '/login'} className="font-medium text-accent underline underline-offset-2">{isLogin ? t('auth.signup') : t('auth.login')}</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
