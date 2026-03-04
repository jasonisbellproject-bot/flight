'use client';

import Link from 'next/link';
import { Plane, Receipt, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--accent-light)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          <Sparkles size={13} />
          PDF Generator
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #f0f0ff 0%, #9898b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Instant Professional<br />Documents
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Generate polished flight itineraries and itemised receipts as downloadable PDFs in seconds.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '640px',
        }}
      >
        <DocCard
          href="/flight"
          icon={<Plane size={22} />}
          title="Flight Itinerary"
          description="Create a professional flight itinerary with airport autocomplete and travel details."
          color="#6366f1"
        />
        <DocCard
          href="/receipt"
          icon={<Receipt size={22} />}
          title="Receipt"
          description="Build itemised receipts with line items, tax calculation and totals."
          color="#818cf8"
        />
      </div>
    </main>
  );
}

function DocCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        className="card"
        style={{
          padding: '28px',
          cursor: 'pointer',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'translateY(-4px)';
          el.style.borderColor = 'rgba(99,102,241,0.35)';
          el.style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = 'translateY(0)';
          el.style.borderColor = 'var(--border)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}20`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            {title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.83rem',
            fontWeight: 600,
            color: 'var(--accent-light)',
            marginTop: 'auto',
          }}
        >
          Open <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
