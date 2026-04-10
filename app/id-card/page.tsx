'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { generateIdCard } from '../../lib/api';
import axios from 'axios';
import {
  IdCard,
  Download,
  ArrowLeft,
  User,
  CalendarDays,
  Image as ImageIcon,
  Link2,
  CheckCircle2,
  FileText,
  Hash
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────── */
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
export default function IdCardPage() {
  const uid = useId();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  const [photoError, setPhotoError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const hasContent = name || dob || issueDate || photoUrl;

  const handlePhotoUrlChange = (val: string) => {
    setPhotoUrl(val);
    setPhotoError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPdfUrl(null);
    setLoading(true);
    try {
      const result = await generateIdCard({
        name,
        dob,
        issueDate,
        expiryDate,
        photoUrl: photoUrl || undefined,
        idNumber: idNumber || undefined
      });
      setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${result.url}`);
    } catch (err: unknown) {
      let message = 'Failed to generate ID card';
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .idcard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (min-width: 860px) {
          .idcard-grid {
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
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .id-mockup {
          width: 320px;
          height: 201px; /* ~ standard id proportion */
          background: linear-gradient(135deg, #1e1e2d 0%, #2a2a40 100%);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          color: #fff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
        }
        
        .id-mockup::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 120px; height: 120px;
          background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(129,140,248,0.2));
          border-radius: 50%;
          filter: blur(15px);
        }
        
        .mockup-header {
          height: 30px;
          background: rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          padding: 0 16px;
          z-index: 10;
        }
        
        .mockup-logo {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
          background: linear-gradient(90deg, #818cf8, #a7f3d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mockup-body {
          flex: 1;
          display: flex;
          gap: 14px;
          padding: 16px;
          z-index: 10;
        }

        .mockup-photo {
          width: 70px;
          height: 90px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mockup-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mockup-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mock-field .mlabel {
          font-size: 8px;
          color: #9898b8;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 2px;
        }
        
        .mock-field .mval {
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
      `}} />

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '100px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          
          <Link href="/" className="back-link">
            <ArrowLeft size={15} />
            Back
          </Link>

          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.25)',
              color: '#10b981', marginBottom: '16px',
            }}>
              <IdCard size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              ID Card Generator
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Create a professional profile/membership ID card instantly as a printable PDF.
            </p>
          </div>

          <div className="idcard-grid">
            {/* ── LEFT: Form ── */}
            <div className="card" style={{ padding: '28px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div>
                  <p className="section-label">Personal Information</p>
                  
                  <div style={{ marginBottom: '14px' }}>
                    <label className="label" htmlFor={`${uid}-name`}>Full Name</label>
                    <div className="icon-input-wrap">
                      <FieldIcon icon={<User size={14} />} />
                      <input
                        id={`${uid}-name`} type="text" required className="input" placeholder="John Doe"
                        value={name} onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label className="label" htmlFor={`${uid}-dob`}>Date of Birth</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CalendarDays size={14} />} />
                        <input
                          id={`${uid}-dob`} type="date" required className="input"
                          value={dob} onChange={(e) => setDob(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-idnum`}>ID Number <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span></label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<Hash size={14} />} />
                        <input
                          id={`${uid}-idnum`} type="text" className="input" placeholder="e.g. 19283746"
                          value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="divider" style={{ margin: '0' }} />

                <div>
                  <p className="section-label">Card Details</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label className="label" htmlFor={`${uid}-issued`}>Issue Date</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CalendarDays size={14} />} />
                        <input
                          id={`${uid}-issued`} type="date" required className="input"
                          value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label" htmlFor={`${uid}-expiry`}>Expiry Date</label>
                      <div className="icon-input-wrap">
                        <FieldIcon icon={<CalendarDays size={14} />} />
                        <input
                          id={`${uid}-expiry`} type="date" required className="input"
                          value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <label className="label" htmlFor={`${uid}-photo`}>
                      Photo URL <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                    </label>
                    <div className="icon-input-wrap" style={{ position: 'relative' }}>
                      <FieldIcon icon={<Link2 size={14} />} />
                      <input
                        id={`${uid}-photo`} type="url" className="input" placeholder="https://example.com/photo.jpg"
                        value={photoUrl} onChange={(e) => handlePhotoUrlChange(e.target.value)}
                      />
                      {photoUrl && !photoError && (
                        <img
                          src={photoUrl} alt="prev" onError={() => setPhotoError(true)}
                          style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px'
                          }}
                        />
                      )}
                    </div>
                    {photoError && <p style={{ fontSize: '0.72rem', color: 'var(--error)', marginTop: '4px' }}>Could not load photo URL</p>}
                  </div>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <button type="submit" disabled={loading} className="btn-primary" style={{ background: 'var(--success)' }}>
                  {loading ? <><span className="spinner" />Generating…</> : <><IdCard size={16} /> Generate ID PDF</>}
                </button>
              </form>
            </div>

            {/* ── RIGHT: Preview ── */}
            <div>
              <div className="preview-card">
                <div className="preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#10b981" />
                    <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>Live Preview</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', padding: '3px 10px' }}>
                    PDF
                  </span>
                </div>

                <div className="preview-body">
                  {!hasContent ? (
                    <div className="placeholder-state">
                      <IdCard size={32} style={{ opacity: 0.25 }} />
                      <p style={{ fontSize: '0.875rem', maxWidth: '180px' }}>Fill out the form to preview the ID card</p>
                    </div>
                  ) : (
                    <div className="id-mockup">
                      <div className="mockup-header">
                        <div className="mockup-logo">DOCGEN</div>
                        <div style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>MEMBER ID</div>
                      </div>
                      <div className="mockup-body">
                        <div className="mockup-photo">
                          {photoUrl && !photoError ? (
                            <img src={photoUrl} alt="Profile" onError={() => setPhotoError(true)} />
                          ) : (
                            name ? <span style={{fontSize: '32px', fontWeight: 800, color: 'rgba(255,255,255,0.2)'}}>{name.charAt(0).toUpperCase()}</span> : <User size={24} color="rgba(255,255,255,0.2)" />
                          )}
                        </div>
                        <div className="mockup-details">
                          <div className="mock-field">
                            <div className="mlabel">Full Name</div>
                            <div className="mval" style={{fontSize: '14px'}}>{name || 'MEMBER NAME'}</div>
                          </div>
                          <div style={{display: 'flex', gap: '8px'}}>
                            <div className="mock-field">
                              <div className="mlabel">DOB</div>
                              <div className="mval">{dob || '--/--/----'}</div>
                            </div>
                            <div className="mock-field">
                              <div className="mlabel">ID NUM</div>
                              <div className="mval">{idNumber || 'AUTO'}</div>
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '8px', marginTop: 'auto'}}>
                            <div className="mock-field">
                              <div className="mlabel">ISSUED</div>
                              <div className="mval">{issueDate || '--/--/----'}</div>
                            </div>
                            <div className="mock-field">
                              <div className="mlabel">EXPIRY</div>
                              <div className="mval">{expiryDate || '--/--/----'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {pdfUrl && (
                <div className="success-banner" style={{ marginTop: '16px' }}>
                  <CheckCircle2 size={22} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem', marginBottom: '2px' }}>ID Card ready!</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Your double-sided PDF is generated.</p>
                  </div>
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                    <Download size={14} /> Download
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
