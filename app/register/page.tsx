'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, UserPlus, Sparkles } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) { setError('Passwords do not match'); return; }
        setError('');
        setLoading(true);
        try {
            await register(email, password);
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 40px' }}>
            <div className="card" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 100, padding: '5px 14px',
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)',
                        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20,
                    }}>
                        <Sparkles size={12} /> Get started for free
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Create account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 8 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
                            Sign in
                        </Link>
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {error && <div className="alert-error">{error}</div>}

                    <div>
                        <label className="label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input id="reg-email" type="email" className="input" style={{ paddingLeft: 36 }}
                                placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                        </div>
                    </div>

                    <div>
                        <label className="label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input id="reg-password" type="password" className="input" style={{ paddingLeft: 36 }}
                                placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <label className="label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input id="reg-confirm" type="password" className="input" style={{ paddingLeft: 36 }}
                                placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                        {loading ? <><span className="spinner" /> Creating account…</> : <><UserPlus size={16} /> Create account</>}
                    </button>
                </form>
            </div>
        </main>
    );
}
