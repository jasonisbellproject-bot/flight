'use client';

import { useState, useId, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { generateReceipt } from '../../lib/api';
import axios from 'axios';
import {
  Receipt,
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Building2,
  CalendarDays,
  Tag,
  Percent,
  CheckCircle2,
  FileText,
  ImageIcon,
  Link2,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  MessageSquare
} from 'lucide-react';

interface Item {
  name: string;
  price: string;
}

/* ─── tiny helpers ──────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function FieldIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        display: 'flex',
        pointerEvents: 'none',
      }}
    >
      {icon}
    </span>
  );
}

/* ─── main component ────────────────────────────────────── */
export default function ReceiptPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const uid = useId();
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<Item[]>([{ name: '', price: '' }]);
  const [tax, setTax] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', price: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const taxVal = parseFloat(tax) || 0;
  const total = subtotal + taxVal;

  const hasContent = businessName || date || items.some(i => i.name || i.price);

  // reset logo error when URL changes
  const handleLogoUrlChange = (val: string) => {
    setLogoUrl(val);
    setLogoError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPdfUrl(null);
    setLoading(true);
    try {
      const result = await generateReceipt({
        businessName,
        logoUrl: logoUrl || undefined,
        date,
        items,
        subtotal: subtotal.toFixed(2),
        tax: tax || '0',
        total: total.toFixed(2),
        storePhone: storePhone || undefined,
        storeEmail: storeEmail || undefined,
        storeAddress: storeAddress || undefined,
        clientName: clientName || undefined,
        clientEmail: clientEmail || undefined,
        clientAddress: clientAddress || undefined,
        paymentMethod: paymentMethod || undefined,
        specialNote: specialNote || undefined,
      });
      setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${result.url}`);
    } catch (err: unknown) {
      let message = 'Failed to generate receipt';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (data && typeof data === 'object' && 'error' in data) {
          const e = (data as { error?: unknown }).error;
          if (typeof e === 'string') message = e;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <>
      {/* ── page styles ── */}
      <style>{`
        .receipt-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (min-width: 860px) {
          .receipt-grid {
            grid-template-columns: 1fr 380px;
            align-items: start;
          }
        }
        .icon-input-wrap {
          position: relative;
        }
        .icon-input-wrap .input {
          padding-left: 38px;
        }
        .item-row {
          display: grid;
          grid-template-columns: 1fr 100px 36px;
          gap: 8px;
          align-items: center;
          animation: slideIn 0.18s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .remove-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .remove-btn:not(:disabled):hover {
          background: rgba(248,113,113,0.1);
          border-color: rgba(248,113,113,0.4);
          color: var(--error) !important;
        }
        .add-item-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--accent-light);
          background: rgba(99,102,241,0.08);
          border: 1px dashed rgba(99,102,241,0.3);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
          cursor: pointer;
          width: 100%;
          justify-content: center;
          transition: background 0.15s, border-color 0.15s;
        }
        .add-item-btn:hover {
          background: rgba(99,102,241,0.14);
          border-color: rgba(99,102,241,0.5);
        }
        /* preview card */
        .preview-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          position: sticky;
          top: 24px;
        }
        .preview-header {
          background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(129,140,248,0.08) 100%);
          border-bottom: 1px solid var(--border);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .preview-body {
          padding: 24px;
        }
        .preview-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 0.875rem;
          border-bottom: 1px dashed rgba(255,255,255,0.05);
          gap: 12px;
        }
        .preview-item-row:last-child {
          border-bottom: none;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 0;
          font-size: 0.875rem;
        }
        .totals-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: var(--radius-sm);
          margin-top: 8px;
        }
        .placeholder-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 40px 24px;
          color: var(--text-muted);
          text-align: center;
        }
        .section-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .success-banner {
          background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.06) 100%);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: var(--radius);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          animation: slideIn 0.25s ease;
        }
        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: var(--success);
          color: #fff;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
        }
        .download-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .tax-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Back */}
          <Link href="/" className="back-link">
            <ArrowLeft size={15} />
            Back
          </Link>

          {/* Page header */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'rgba(129,140,248,0.15)',
                border: '1px solid rgba(129,140,248,0.25)',
                color: 'var(--accent-light)',
                marginBottom: '16px',
              }}
            >
              <Receipt size={24} />
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              Receipt Generator
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Add items, apply tax, and download a polished PDF receipt instantly.
            </p>
          </div>

          {/* Two-column grid */}
          <div className="receipt-grid">
            {/* ── LEFT: Form ── */}
            <div className="card" style={{ padding: '28px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Business + Date */}
                <div>
                  <p className="section-label">Business Details</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label className="label" htmlFor={`${uid}-biz`}>Business Name</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Building2 size={14} />} />
                        <input
                          id={`${uid}-biz`}
                          type="text"
                          required
                          className="input"
                          placeholder="Acme Corp"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-date`}>Date</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CalendarDays size={14} />} />
                        <input
                          id={`${uid}-date`}
                          type="date"
                          required
                          className="input"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo URL */}
                  <div style={{ marginTop: '14px' }}>
                    <label className="label" htmlFor={`${uid}-logo`}>
                      Logo URL&nbsp;<span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)', fontSize: '0.75rem' }}>(optional)</span>
                    </label>
                    <div className="icon-input-wrap" style={{ position: 'relative' }}>
                      <FieldIcon icon={<Link2 size={14} />} />
                      <input
                        id={`${uid}-logo`}
                        type="url"
                        className="input"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => handleLogoUrlChange(e.target.value)}
                      />
                      {/* inline logo thumb */}
                      {logoUrl && !logoError && (
                        <img
                          src={logoUrl}
                          alt="logo preview"
                          onError={() => setLogoError(true)}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '22px',
                            height: '22px',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.05)',
                          }}
                        />
                      )}
                      {logoUrl && logoError && (
                        <span
                          title="Could not load image"
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--error)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          ✕
                        </span>
                      )}
                    </div>
                    {logoError && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--error)', marginTop: '4px' }}>
                        Could not load image — using initials fallback instead.
                      </p>
                    )}
                  </div>

                  {/* Optional Store Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                    <div>
                      <label className="label" htmlFor={`${uid}-storePhone`}>Store Phone <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(Optional)</span></label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Phone size={14} />} />
                        <input id={`${uid}-storePhone`} className="input" value={storePhone} onChange={e => setStorePhone(e.target.value)} placeholder="(555) 123-4567" />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-storeEmail`}>Store Email <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(Optional)</span></label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Mail size={14} />} />
                        <input id={`${uid}-storeEmail`} type="email" className="input" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} placeholder="hello@store.com" />
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <label className="label" htmlFor={`${uid}-storeAddr`}>Store Address <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(Optional)</span></label>
                    <div className="icon-input-wrap">
                      <FieldIcon icon={<MapPin size={14} />} />
                      <input id={`${uid}-storeAddr`} className="input" value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="123 Main St, City" />
                    </div>
                  </div>
                </div>

                <hr className="divider" style={{ margin: '0' }} />

                {/* Client Details */}
                <div>
                  <p className="section-label">Client Details (Billed To) <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(Optional)</span></p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                    <div>
                      <label className="label" htmlFor={`${uid}-clientName`}>Client Name</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<User size={14} />} />
                        <input id={`${uid}-clientName`} className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Jane Doe" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label className="label" htmlFor={`${uid}-clientEmail`}>Client Email</label>
                        <div className="icon-input-wrap">
                          <FieldIcon icon={<Mail size={14} />} />
                          <input id={`${uid}-clientEmail`} type="email" className="input" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="jane@example.com" />
                        </div>
                      </div>
                      <div>
                        <label className="label" htmlFor={`${uid}-clientAddr`}>Client Address</label>
                        <div className="icon-input-wrap">
                          <FieldIcon icon={<MapPin size={14} />} />
                          <input id={`${uid}-clientAddr`} className="input" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="456 Oak St" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="divider" style={{ margin: '0' }} />

                {/* Items */}
                <div>
                  <p className="section-label">Line Items</p>

                  {/* Column headers */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 36px',
                      gap: '8px',
                      marginBottom: '6px',
                      paddingLeft: '2px',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Description</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Price</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {items.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="icon-input-wrap">
                          <FieldIcon icon={<Tag size={13} />} />
                          <input
                            type="text"
                            placeholder={`Item ${index + 1}`}
                            required
                            className="input"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <input
                          type="number"
                          placeholder="0.00"
                          required
                          step="0.01"
                          min="0"
                          className="input"
                          style={{ textAlign: 'right' }}
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          style={{
                            color: items.length === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                            opacity: items.length === 1 ? 0.35 : 1,
                            cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                          }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="add-item-btn" onClick={addItem}>
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>

                <hr className="divider" style={{ margin: '0' }} />

                {/* Additional Info */}
                <div>
                  <p className="section-label">Additional Info <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--text-muted)' }}>(Optional)</span></p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label className="label" htmlFor={`${uid}-pay`}>Payment Method</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CreditCard size={14} />} />
                        <input id={`${uid}-pay`} className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="e.g. Visa ending in 4242" />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-note`}>Special Note</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<MessageSquare size={14} />} />
                        <input id={`${uid}-note`} className="input" value={specialNote} onChange={e => setSpecialNote(e.target.value)} placeholder="Thank you for your business!" />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="divider" style={{ margin: '0' }} />

                {/* Totals */}
                <div>
                  <p className="section-label">Summary</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="totals-row">
                      <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        ${fmt(subtotal)}
                      </span>
                    </div>

                    <div className="tax-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Percent size={13} style={{ color: 'var(--text-muted)' }} />
                        <label className="label" style={{ margin: 0 }} htmlFor={`${uid}-tax`}>Tax</label>
                      </div>
                      <input
                        id={`${uid}-tax`}
                        type="number"
                        step="0.01"
                        min="0"
                        className="input"
                        style={{ width: '110px', textAlign: 'right' }}
                        placeholder="0.00"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                      />
                    </div>

                    <div className="totals-total">
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-light)' }}>
                        ${fmt(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && <div className="alert-error">{error}</div>}

                {/* Submit */}
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? (
                    <>
                      <span className="spinner" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Receipt size={16} />
                      Generate PDF Receipt
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ── RIGHT: Live Preview ── */}
            <div>
              <div className="preview-card">
                <div className="preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--accent-light)' }} />
                    <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                      Live Preview
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-light)',
                      background: 'rgba(99,102,241,0.12)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '100px',
                      padding: '3px 10px',
                    }}
                  >
                    PDF
                  </span>
                </div>

                <div className="preview-body">
                  {!hasContent ? (
                    <div className="placeholder-state">
                      <Receipt size={32} style={{ opacity: 0.25 }} />
                      <p style={{ fontSize: '0.875rem', maxWidth: '180px' }}>
                        Fill in the form to see a live preview here
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Business + date */}
                      {/* Logo / letter avatar + business info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                        {/* Logo avatar */}
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '10px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: logoUrl && !logoError
                              ? 'rgba(255,255,255,0.05)'
                              : 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.15) 100%)',
                          }}
                        >
                          {logoUrl && !logoError ? (
                            <img
                              src={logoUrl}
                              alt="logo"
                              onError={() => setLogoError(true)}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : businessName ? (
                            <span
                              style={{
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                color: 'var(--accent-light)',
                                lineHeight: 1,
                                userSelect: 'none',
                              }}
                            >
                              {businessName.trim().charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <ImageIcon size={20} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                          )}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: '1rem',
                              fontWeight: 800,
                              color: 'var(--text-primary)',
                              marginBottom: '3px',
                              wordBreak: 'break-word',
                            }}
                          >
                            {businessName || <span style={{ color: 'var(--text-muted)' }}>Business Name</span>}
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {date
                              ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric',
                              })
                              : 'Date not set'}
                          </p>
                          {storePhone && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tel: {storePhone}</p>}
                          {storeEmail && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email: {storeEmail}</p>}
                          {storeAddress && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{storeAddress}</p>}
                        </div>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '14px' }} />

                      {clientName && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Billed To</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{clientName}</div>
                          {clientEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{clientEmail}</div>}
                          {clientAddress && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{clientAddress}</div>}
                        </div>
                      )}

                      {/* Items */}
                      <div style={{ marginBottom: '16px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span>Description</span>
                          <span>Price</span>
                        </div>
                        {items.map((item, i) => (
                          <div key={i} className="preview-item-row">
                            <span
                              style={{
                                color: item.name ? 'var(--text-primary)' : 'var(--text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.name || `Item ${i + 1}`}
                            </span>
                            <span
                              style={{
                                color: item.price ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontVariantNumeric: 'tabular-nums',
                                flexShrink: 0,
                              }}
                            >
                              ${fmt(parseFloat(item.price) || 0)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '12px' }} />

                      {/* Totals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="totals-row" style={{ color: 'var(--text-secondary)' }}>
                          <span>Subtotal</span>
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>${fmt(subtotal)}</span>
                        </div>
                        <div className="totals-row" style={{ color: 'var(--text-secondary)' }}>
                          <span>Tax</span>
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>${fmt(taxVal)}</span>
                        </div>
                        <div className="totals-total" style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                          <span
                            style={{
                              fontSize: '1.1rem',
                              fontWeight: 800,
                              color: 'var(--accent-light)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            ${fmt(total)}
                          </span>
                        </div>
                      </div>

                      {paymentMethod && (
                        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Payment Method:</span> {paymentMethod}
                        </div>
                      )}

                      {specialNote && (
                        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>Note</span>
                          {specialNote}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Success banner inside right column */}
              {pdfUrl && (
                <div className="success-banner" style={{ marginTop: '16px' }}>
                  <CheckCircle2 size={22} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem', marginBottom: '2px' }}>
                      Receipt ready!
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Your PDF has been generated.</p>
                  </div>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                    <Download size={14} />
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
