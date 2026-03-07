'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plane, Shield, LogIn, LogOut, UserPlus, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function handleLogout() {
        logout();
        setOpen(false);
        router.push('/');
    }

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: '60px',
            background: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Plane size={16} color="#fff" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>DocGen</span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!user ? (
                    <>
                        <Link href="/login" style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 14px', borderRadius: 8,
                            fontSize: '0.85rem', fontWeight: 500,
                            color: 'var(--text-secondary)', textDecoration: 'none',
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                            <LogIn size={15} /> Sign in
                        </Link>
                        <Link href="/register" style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 16px', borderRadius: 8,
                            fontSize: '0.85rem', fontWeight: 600,
                            color: '#fff', textDecoration: 'none',
                            background: 'var(--accent)',
                            transition: 'background 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                        >
                            <UserPlus size={15} /> Sign up
                        </Link>
                    </>
                ) : (
                    <div style={{ position: 'relative' }} ref={menuRef}>
                        <button
                            onClick={() => setOpen(o => !o)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '6px 14px', borderRadius: 8,
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.2)',
                                color: 'var(--text-primary)',
                                fontSize: '0.85rem', fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                            }}>
                                {user.email.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </span>
                            {user.role === 'admin' && (
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b',
                                    background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                                    padding: '1px 6px', borderRadius: 100, letterSpacing: '0.05em',
                                }}>ADMIN</span>
                            )}
                            <ChevronDown size={14} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </button>

                        {open && (
                            <div style={{
                                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                                minWidth: 200,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 10, overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}>
                                <Link href="/dashboard" onClick={() => setOpen(false)} style={menuItemStyle}>
                                    <LayoutDashboard size={15} /> My Dashboard
                                </Link>
                                {user.role === 'admin' && (
                                    <Link href="/admin" onClick={() => setOpen(false)} style={{ ...menuItemStyle, color: '#f59e0b' }}>
                                        <Shield size={15} /> Admin Panel
                                    </Link>
                                )}
                                <div style={{ borderTop: '1px solid var(--border)' }} />
                                <button onClick={handleLogout} style={{ ...menuItemStyle, width: '100%', border: 'none', background: 'none', color: 'var(--error)', cursor: 'pointer', textAlign: 'left' }}>
                                    <LogOut size={15} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

const menuItemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '11px 16px',
    fontSize: '0.875rem', fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    cursor: 'pointer',
};
