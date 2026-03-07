'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authHeaders } from '@/lib/auth';
import {
    Shield, Users, FileText, Plane, Receipt,
    Trash2, Download, ArrowLeft, ChevronUp, ChevronDown,
    Activity
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface DocRow { id: string; type: string; file_url: string; created_at: string; user_email: string | null; }
interface UserRow { id: string; email: string; role: string; created_at: string; document_count: number; }
interface Stats { totalUsers: number; totalDocuments: number; byType: { type: string; count: number }[]; recentDocuments: DocRow[]; }

type Tab = 'overview' | 'documents' | 'users';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<Stats | null>(null);
    const [docs, setDocs] = useState<DocRow[]>([]);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [fetching, setFetching] = useState(true);

    const hdr = { ...authHeaders(), 'Content-Type': 'application/json' };

    const fetchAll = useCallback(async () => {
        setFetching(true);
        try {
            const [sRes, dRes, uRes] = await Promise.all([
                fetch(`${API}/api/admin/stats`, { headers: hdr }),
                fetch(`${API}/api/admin/documents`, { headers: hdr }),
                fetch(`${API}/api/admin/users`, { headers: hdr }),
            ]);
            if (sRes.ok) setStats(await sRes.json());
            if (dRes.ok) setDocs((await dRes.json()).documents);
            if (uRes.ok) setUsers((await uRes.json()).users);
        } catch { /* ignore */ }
        finally { setFetching(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'admin') { router.push('/login'); return; }
            fetchAll();
        }
    }, [user, loading, router, fetchAll]);

    async function deleteDoc(id: string) {
        if (!confirm('Delete this document?')) return;
        const res = await fetch(`${API}/api/admin/documents/${id}`, { method: 'DELETE', headers: hdr });
        if (res.ok) setDocs(d => d.filter(doc => doc.id !== id));
    }

    async function toggleRole(u: UserRow) {
        const newRole = u.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change ${u.email} to ${newRole}?`)) return;
        const res = await fetch(`${API}/api/admin/users/${u.id}/role`, {
            method: 'PATCH', headers: hdr, body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) setUsers(us => us.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    }

    if (loading || fetching) return <Loading />;

    const itCount = stats?.byType.find(b => b.type === 'itinerary')?.count || 0;
    const recCount = stats?.byType.find(b => b.type === 'receipt')?.count || 0;

    return (
        <main style={{ minHeight: '100vh', maxWidth: 1080, margin: '0 auto', padding: '100px 24px 60px' }}>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
                <Link href="/" className="back-link"><ArrowLeft size={15} /> Home</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Shield size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Admin Panel</h1>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage users and documents</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {(['overview', 'documents', 'users'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 7, border: 'none',
                        background: tab === t ? 'var(--bg-card)' : 'transparent',
                        color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontWeight: tab === t ? 600 : 400, fontSize: '0.875rem',
                        cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
                    }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* === OVERVIEW === */}
            {tab === 'overview' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 32 }}>
                        <Stat icon={<Users size={20} />} label="Total Users" value={stats?.totalUsers ?? 0} color="#6366f1" />
                        <Stat icon={<FileText size={20} />} label="Total Documents" value={stats?.totalDocuments ?? 0} color="#818cf8" />
                        <Stat icon={<Plane size={20} />} label="Itineraries" value={itCount} color="#a5b4fc" />
                        <Stat icon={<Receipt size={20} />} label="Receipts" value={recCount} color="#c7d2fe" />
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Activity size={15} style={{ color: 'var(--accent-light)' }} />
                            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Recent Activity</h2>
                        </div>
                        {(stats?.recentDocuments || []).map((d, i, arr) => (
                            <DocRowItem key={d.id} doc={d} last={i === arr.length - 1} onDelete={deleteDoc} />
                        ))}
                    </div>
                </div>
            )}

            {/* === DOCUMENTS === */}
            {tab === 'documents' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>All Documents ({docs.length})</h2>
                    </div>
                    {docs.length === 0 ? <Empty label="No documents generated yet." /> : (
                        docs.map((d, i) => <DocRowItem key={d.id} doc={d} last={i === docs.length - 1} onDelete={deleteDoc} />)
                    )}
                </div>
            )}

            {/* === USERS === */}
            {tab === 'users' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>All Users ({users.length})</h2>
                    </div>
                    {users.length === 0 ? <Empty label="No users yet." /> : (
                        users.map((u, i) => (
                            <div key={u.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 24px',
                                borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: '50%',
                                        background: u.role === 'admin' ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #6366f1, #818cf8)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                                    }}>
                                        {u.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {u.document_count} doc{u.document_count !== 1 ? 's' : ''} · Joined {new Date(u.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700,
                                        padding: '3px 9px', borderRadius: 100,
                                        background: u.role === 'admin' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)',
                                        border: `1px solid ${u.role === 'admin' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
                                        color: u.role === 'admin' ? '#f59e0b' : 'var(--accent-light)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        {u.role}
                                    </span>
                                    <button onClick={() => toggleRole(u)} style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                                        background: 'transparent', color: 'var(--text-secondary)',
                                        fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                    >
                                        {u.role === 'admin' ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                                        {u.role === 'admin' ? 'Demote' : 'Promote'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </main>
    );
}

function DocRowItem({ doc, last, onDelete }: { doc: DocRow; last: boolean; onDelete: (id: string) => void }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px',
            borderBottom: last ? 'none' : '1px solid var(--border)',
            transition: 'background 0.15s',
        }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: doc.type === 'itinerary' ? 'rgba(99,102,241,0.12)' : 'rgba(129,140,248,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: doc.type === 'itinerary' ? '#6366f1' : '#818cf8',
                }}>
                    {doc.type === 'itinerary' ? <Plane size={15} /> : <Receipt size={15} />}
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>{doc.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {doc.user_email ?? 'Anonymous'} · {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <a href={`${API}${doc.file_url}`} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '5px 12px', borderRadius: 6,
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    color: 'var(--accent-light)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                }}>
                    <Download size={12} />
                </a>
                <button onClick={() => onDelete(doc.id)} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '5px 12px', borderRadius: 6,
                    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                    color: 'var(--error)', cursor: 'pointer',
                }}>
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ color, opacity: 0.8 }}>{icon}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
        </div>
    );
}

function Empty({ label }: { label: string }) {
    return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</div>;
}

function Loading() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
    );
}
