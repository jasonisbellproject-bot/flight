'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { generateReceipt } from '../../lib/api';
import {
  Receipt, Download, Plus, Trash2, ArrowLeft,
  Building2, CalendarDays, Tag, Percent, CheckCircle2,
  FileText, ImageIcon, Link2, User, MapPin, Phone, Mail,
  Briefcase, ChevronDown,
} from 'lucide-react';

interface Item {
  name: string;
  qty: string;
  unit: string;
  rate: string;
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD — US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR — Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP — British Pound' },
  { code: 'CAD', symbol: 'C$', label: 'CAD — Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD — Australian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'JPY — Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', label: 'CHF — Swiss Franc' },
  { code: 'INR', symbol: '₹', label: 'INR — Indian Rupee' },
];

function fmt(n: number, sym: string) {
  return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function FieldIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
      {icon}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-light)' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
    </div>
  );
}

export default function ReceiptPage() {
  const uid = useId();

  // Business / sender
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [fromAddress, setFromAddress] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromPhone, setFromPhone] = useState('');

  // Client / bill-to
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Invoice details
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Line items
  const [items, setItems] = useState<Item[]>([{ name: '', qty: '1', unit: 'Item', rate: '' }]);

  // Summary
  const [tax, setTax] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  // UI
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const sym = currencyObj.symbol;

  const handleItemChange = (index: number, field: keyof Item, value: string) => {
    const next = [...items];
    next[index][field] = value;
    setItems(next);
  };
  const addItem = () => setItems([...items, { name: '', qty: '1', unit: 'Item', rate: '' }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 1) * (parseFloat(item.rate) || 0), 0);
  const taxVal = parseFloat(tax) || 0;
  const total = subtotal + taxVal;

  const handleLogoUrlChange = (val: string) => { setLogoUrl(val); setLogoError(false); };

  const hasContent = businessName || items.some(i => i.name || i.rate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setPdfUrl(null); setLoading(true);
    try {
      const result = await generateReceipt({
        businessName, logoUrl: logoUrl || undefined,
        fromAddress, fromEmail, fromPhone,
        clientName, clientAddress, clientEmail, clientPhone,
        date, dueDate, projectName, currency,
        items,
        subtotal: subtotal.toFixed(2),
        tax: tax || '0',
        total: total.toFixed(2),
        notes,
      });
      setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${result.url}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .r-grid { display:grid; grid-template-columns:1fr; gap:24px; width:100%; max-width:1080px; margin:0 auto; }
        @media(min-width:900px){ .r-grid{ grid-template-columns:1fr 360px; align-items:start; } }
        .icon-input-wrap { position:relative; }
        .icon-input-wrap .input { padding-left:38px; }
        .select-wrap { position:relative; }
        .select-wrap select {
          width:100%; padding:10px 36px 10px 38px;
          background:var(--bg-secondary); border:1px solid var(--border);
          border-radius:var(--radius-sm); color:var(--text-primary);
          font-size:0.875rem; font-family:inherit; outline:none;
          appearance:none; cursor:pointer;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .select-wrap select:focus {
          border-color:var(--border-focus);
          box-shadow:0 0 0 3px var(--accent-glow);
        }
        .select-arrow { position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; color:var(--text-muted); }
        .item-row { display:grid; grid-template-columns:2fr 60px 80px 90px 36px; gap:8px; align-items:center; animation:slideIn 0.18s ease; }
        @media(max-width:600px){ .item-row{ grid-template-columns:1fr 90px 36px; } .item-row .col-qty, .item-row .col-unit { display:none; } }
        @keyframes slideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .remove-btn { width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;cursor:pointer;transition:background 0.15s,border-color 0.15s,color 0.15s;flex-shrink:0; }
        .remove-btn:not(:disabled):hover { background:rgba(248,113,113,0.1);border-color:rgba(248,113,113,0.4);color:var(--error) !important; }
        .add-item-btn { display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:0.83rem;font-weight:600;color:var(--accent-light);background:rgba(99,102,241,0.08);border:1px dashed rgba(99,102,241,0.3);border-radius:var(--radius-sm);padding:8px 14px;cursor:pointer;width:100%;justify-content:center;transition:background 0.15s,border-color 0.15s; }
        .add-item-btn:hover { background:rgba(99,102,241,0.14);border-color:rgba(99,102,241,0.5); }
        .col-header { font-size:0.68rem;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:var(--text-muted); }

        /* Preview card */
        .preview-card { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;position:sticky;top:24px; }
        .preview-header { background:linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(129,140,248,0.08) 100%);border-bottom:1px solid var(--border);padding:16px 20px;display:flex;align-items:center;justify-content:space-between; }
        .preview-body { padding:20px; }
        .preview-party { font-size:0.75rem; line-height:1.6; }
        .preview-party strong { color:var(--text-primary); font-size:0.82rem; }
        .preview-party span { color:var(--text-muted); }
        .preview-item-row { display:grid;grid-template-columns:1fr auto;gap:8px;padding:5px 0;border-bottom:1px dashed rgba(255,255,255,0.05);font-size:0.8rem;align-items:center; }
        .totals-total { display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:var(--radius-sm);margin-top:8px; }
        .success-banner { background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06));border:1px solid rgba(16,185,129,0.3);border-radius:var(--radius);padding:18px 20px;display:flex;align-items:center;gap:14px;animation:slideIn 0.25s ease;margin-top:16px; }
        .download-btn { display:inline-flex;align-items:center;gap:6px;padding:10px 18px;background:var(--success);color:#fff;border-radius:var(--radius-sm);font-size:0.875rem;font-weight:600;text-decoration:none;white-space:nowrap;transition:opacity 0.2s,transform 0.15s;flex-shrink:0; }
        .download-btn:hover { opacity:0.9;transform:translateY(-1px); }
        .form-card { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:28px; }
        .sub-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        @media(max-width:520px){ .sub-grid-2{ grid-template-columns:1fr; } }
        .form-section { display:flex;flex-direction:column;gap:14px; }
        .textarea { width:100%;padding:10px 14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:0.875rem;font-family:inherit;outline:none;resize:vertical;min-height:80px;transition:border-color 0.2s,box-shadow 0.2s; }
        .textarea:focus { border-color:var(--border-focus);box-shadow:0 0 0 3px var(--accent-glow); }
        .textarea::placeholder { color:var(--text-muted); }
      `}</style>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }}>

          {/* Back */}
          <Link href="/" className="back-link"><ArrowLeft size={15} />Back</Link>

          {/* Page header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.25)', color: 'var(--accent-light)', marginBottom: '16px' }}>
              <Receipt size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '6px' }}>Receipt Generator</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fill in the form to generate a professional PDF receipt instantly.</p>
          </div>

          <div className="r-grid">
            {/* ── LEFT: Form ── */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* ── 1. BUSINESS DETAILS ── */}
              <div className="form-card">
                <SectionHeader title="From — Business Details" />
                <div className="form-section">
                  <div className="sub-grid-2">
                    <div>
                      <label className="label" htmlFor={`${uid}-biz`}>Business Name *</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Building2 size={14} />} />
                        <input id={`${uid}-biz`} type="text" required className="input" placeholder="Acme Corp" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-logo`}>Logo URL <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.72rem', color: 'var(--text-muted)' }}>(optional)</span></label>
                      <div className="icon-input-wrap" style={{ position: 'relative' }}>
                        <FieldIcon icon={<Link2 size={14} />} />
                        <input id={`${uid}-logo`} type="url" className="input" style={{ paddingRight: logoUrl ? '40px' : undefined }} placeholder="https://example.com/logo.png" value={logoUrl} onChange={e => handleLogoUrlChange(e.target.value)} />
                        {logoUrl && !logoError && <img src={logoUrl} alt="" onError={() => setLogoError(true)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} />}
                        {logoUrl && logoError && <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--error)', fontSize: '0.7rem', fontWeight: 600 }}>✕</span>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor={`${uid}-from-addr`}>Address</label>
                    <div className="icon-input-wrap">
                      <FieldIcon icon={<MapPin size={14} />} />
                      <input id={`${uid}-from-addr`} type="text" className="input" placeholder="123 Main St, New York, NY 10001" value={fromAddress} onChange={e => setFromAddress(e.target.value)} />
                    </div>
                  </div>

                  <div className="sub-grid-2">
                    <div>
                      <label className="label" htmlFor={`${uid}-from-email`}>Email</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Mail size={14} />} />
                        <input id={`${uid}-from-email`} type="email" className="input" placeholder="hello@acme.com" value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-from-phone`}>Phone</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Phone size={14} />} />
                        <input id={`${uid}-from-phone`} type="tel" className="input" placeholder="+1 (555) 000-0000" value={fromPhone} onChange={e => setFromPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. CLIENT / BILL TO ── */}
              <div className="form-card">
                <SectionHeader title="Bill To — Client Details" subtitle="Optional — leave blank if not applicable" />
                <div className="form-section">
                  <div>
                    <label className="label" htmlFor={`${uid}-client-name`}>Client Name</label>
                    <div className="icon-input-wrap">
                      <FieldIcon icon={<User size={14} />} />
                      <input id={`${uid}-client-name`} type="text" className="input" placeholder="Volta Consumer Goods" value={clientName} onChange={e => setClientName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor={`${uid}-client-addr`}>Address</label>
                    <div className="icon-input-wrap">
                      <FieldIcon icon={<MapPin size={14} />} />
                      <input id={`${uid}-client-addr`} type="text" className="input" placeholder="88 Thornfield Ave, Chicago, IL 60601" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
                    </div>
                  </div>
                  <div className="sub-grid-2">
                    <div>
                      <label className="label" htmlFor={`${uid}-client-email`}>Email</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Mail size={14} />} />
                        <input id={`${uid}-client-email`} type="email" className="input" placeholder="accounts@client.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-client-phone`}>Phone</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Phone size={14} />} />
                        <input id={`${uid}-client-phone`} type="tel" className="input" placeholder="+1 (555) 000-0000" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 3. RECEIPT DETAILS ── */}
              <div className="form-card">
                <SectionHeader title="Receipt Details" />
                <div className="form-section">
                  <div className="sub-grid-2">
                    <div>
                      <label className="label" htmlFor={`${uid}-date`}>Issue Date *</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CalendarDays size={14} />} />
                        <input id={`${uid}-date`} type="date" required className="input" value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-due`}>Due Date</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CalendarDays size={14} />} />
                        <input id={`${uid}-due`} type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="sub-grid-2">
                    <div>
                      <label className="label" htmlFor={`${uid}-project`}>Project Name</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Briefcase size={14} />} />
                        <input id={`${uid}-project`} type="text" className="input" placeholder="Brand Identity" value={projectName} onChange={e => setProjectName(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-currency`}>Currency</label>
                      <div className="icon-input-wrap select-wrap">
                        <FieldIcon icon={<ChevronDown size={14} />} />
                        <select id={`${uid}-currency`} value={currency} onChange={e => setCurrency(e.target.value)} style={{ paddingLeft: '38px' }}>
                          {CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>{c.label}</option>
                          ))}
                        </select>
                        <span className="select-arrow"><ChevronDown size={14} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 4. LINE ITEMS ── */}
              <div className="form-card">
                <SectionHeader title="Line Items" />

                {/* Column headers */}
                <div className="item-row" style={{ marginBottom: '6px', paddingLeft: '2px' }}>
                  <span className="col-header">Description</span>
                  <span className="col-header col-qty">Qty</span>
                  <span className="col-header col-unit">Unit</span>
                  <span className="col-header" style={{ textAlign: 'right' }}>Rate</span>
                  <span />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Tag size={13} />} />
                        <input type="text" placeholder={`Item ${index + 1}`} required className="input" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} />
                      </div>
                      <input type="number" placeholder="1" min="0.01" step="any" required className="input col-qty" style={{ textAlign: 'center', padding: '10px 6px' }} value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} />
                      <input type="text" placeholder="Item" className="input col-unit" style={{ padding: '10px 8px' }} value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} />
                      <input type="number" placeholder="0.00" min="0" step="0.01" required className="input" style={{ textAlign: 'right' }} value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} />
                      <button type="button" className="remove-btn" onClick={() => removeItem(index)} disabled={items.length === 1} style={{ color: items.length === 1 ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: items.length === 1 ? 0.35 : 1, cursor: items.length === 1 ? 'not-allowed' : 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" className="add-item-btn" onClick={addItem} style={{ marginTop: '12px' }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {/* ── 5. SUMMARY ── */}
              <div className="form-card">
                <SectionHeader title="Summary" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fmt(subtotal, sym)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Percent size={13} style={{ color: 'var(--text-muted)' }} />
                      <label className="label" style={{ margin: 0 }} htmlFor={`${uid}-tax`}>Tax</label>
                    </div>
                    <input id={`${uid}-tax`} type="number" step="0.01" min="0" className="input" style={{ width: '120px', textAlign: 'right' }} placeholder="0.00" value={tax} onChange={e => setTax(e.target.value)} />
                  </div>
                  <div className="totals-total">
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-light)' }}>{fmt(total, sym)}</span>
                  </div>
                </div>
              </div>

              {/* ── 6. NOTES ── */}
              <div className="form-card">
                <SectionHeader title="Payment Notes" subtitle="Printed at the bottom of the receipt — optional" />
                <textarea
                  className="textarea"
                  placeholder="Please remit payment via bank transfer within 21 days. Thank you for your business."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {error && <div className="alert-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (<><span className="spinner" />Generating…</>) : (<><Receipt size={16} />Generate PDF Receipt</>)}
              </button>
            </form>

            {/* ── RIGHT: Live Preview + Success ── */}
            <div>
              <div className="preview-card">
                <div className="preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} style={{ color: 'var(--accent-light)' }} />
                    <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Preview</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--accent-light)', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', padding: '3px 10px' }}>
                    {currencyObj.code}
                  </span>
                </div>

                <div className="preview-body">
                  {!hasContent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '40px 20px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      <Receipt size={32} style={{ opacity: 0.2 }} />
                      <p style={{ fontSize: '0.82rem', maxWidth: '180px' }}>Fill in the form to see a live preview here</p>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '8px', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: logoUrl && !logoError ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(129,140,248,0.15))' }}>
                          {logoUrl && !logoError
                            ? <img src={logoUrl} alt="" onError={() => setLogoError(true)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : businessName
                              ? <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-light)', lineHeight: 1 }}>{businessName.trim().charAt(0).toUpperCase()}</span>
                              : <ImageIcon size={18} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem', wordBreak: 'break-word' }}>{businessName || '—'}</p>
                          {fromEmail && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fromEmail}</p>}
                        </div>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '12px' }} />

                      {/* Date + Client */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div className="preview-party">
                          <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>From</span>
                          <strong>{businessName || '—'}</strong><br />
                          {fromAddress && <span>{fromAddress}<br /></span>}
                        </div>
                        {clientName && (
                          <div className="preview-party">
                            <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Bill To</span>
                            <strong>{clientName}</strong><br />
                            {clientAddress && <span>{clientAddress}</span>}
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      {(date || projectName) && (
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {date && <span><b style={{ color: 'var(--text-secondary)' }}>Date:</b> {date}</span>}
                          {dueDate && <span><b style={{ color: 'var(--text-secondary)' }}>Due:</b> {dueDate}</span>}
                          {projectName && <span><b style={{ color: 'var(--text-secondary)' }}>Project:</b> {projectName}</span>}
                        </div>
                      )}

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '10px' }} />

                      {/* Items */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginBottom: '6px', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          <span>Description</span><span>Amount</span>
                        </div>
                        {items.map((item, i) => {
                          const amount = (parseFloat(item.qty) || 1) * (parseFloat(item.rate) || 0);
                          return (
                            <div key={i} className="preview-item-row">
                              <div>
                                <span style={{ color: item.name ? 'var(--text-primary)' : 'var(--text-muted)' }}>{item.name || `Item ${i + 1}`}</span>
                                <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{item.qty || 1} × {sym}{parseFloat(item.rate || '0').toFixed(2)}</span>
                              </div>
                              <span style={{ color: item.rate ? 'var(--text-primary)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{fmt(amount, sym)}</span>
                            </div>
                          );
                        })}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '10px' }} />

                      {/* Totals */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Subtotal</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(subtotal, sym)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Tax</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(taxVal, sym)}</span>
                        </div>
                      </div>
                      <div className="totals-total">
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Total</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent-light)', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>{fmt(total, sym)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Success banner */}
              {pdfUrl && (
                <div className="success-banner">
                  <CheckCircle2 size={22} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem', marginBottom: '2px' }}>Receipt ready!</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your PDF has been generated.</p>
                  </div>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                    <Download size={14} />Download
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
