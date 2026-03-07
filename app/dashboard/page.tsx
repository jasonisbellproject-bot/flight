'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authHeaders } from '@/lib/auth';
import { Plane, Receipt, Download, Clock, FileText, ArrowLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Document {
    id: string;
    type: string;
    file_url: string;
    created_at: string;
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [docs, setDocs] = useState<Document[]>([]);
    const [fetching, setFetching] = useState(true);

    const fetchDocs = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/user/documents`, {
                headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (res.ok) setDocs(data.documents || []);
        } catch { /* ignore */ }
        finally { setFetching(false); }
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user) { router.push('/login'); return; }
            fetchDocs();
        }
    }, [user, loading, router, fetchDocs]);

    if (loading || fetching) return <LoadingScreen />;

    const itineraries = docs.filter(d => d.type === 'itinerary');
    const receipts = docs.filter(d => d.type === 'receipt');

    return (
        <main style={{ minHeight: '100vh', maxWidth: 800, margin: '0 auto', padding: '100px 24px 60px' }}>
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
                <Link href="/" className="back-link"><ArrowLeft size={15} /> Home</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', fontWeight: 800, color: '#fff',
                    }}>
                        {user!.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>My Dashboard</h1>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user!.email}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
                <StatCard icon={<FileText size={20} />} label="Total Documents" value={docs.length} color="#6366f1" />
                <StatCard icon={<Plane size={20} />} label="Itineraries" value={itineraries.length} color="#818cf8" />
                <StatCard icon={<Receipt size={20} />} label="Receipts" value={receipts.length} color="#a5b4fc" />
            </div>

            {/* Document list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock size={16} style={{ color: 'var(--accent-light)' }} />
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Recent Documents</h2>
                </div>

                {docs.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p style={{ margin: 0 }}>No documents yet. <Link href="/flight" style={{ color: 'var(--accent-light)' }}>Generate your first one!</Link></p>
                    </div>
                ) : (
                    <div>
                        {docs.map((doc, i) => (
                            <div key={doc.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '16px 24px',
                                borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none',
                                transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 8,
                                        background: doc.type === 'itinerary' ? 'rgba(99,102,241,0.12)' : 'rgba(129,140,248,0.12)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: doc.type === 'itinerary' ? '#6366f1' : '#818cf8',
                                    }}>
                                        {doc.type === 'itinerary' ? <Plane size={16} /> : <Receipt size={16} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{doc.type}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <a href={`${API}${doc.file_url}`} target="_blank" rel="noopener noreferrer" style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '6px 14px', borderRadius: 7,
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                                    color: 'var(--accent-light)', fontSize: '0.82rem', fontWeight: 600,
                                    textDecoration: 'none', transition: 'background 0.2s',
                                }}>
                                    <Download size={13} /> Download
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ color, opacity: 0.8 }}>{icon}</div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
            </div>
        </div>
    );
}
