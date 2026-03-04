'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateReceipt } from '../../lib/api';
import { Receipt, Download, Plus, Trash2, ArrowLeft } from 'lucide-react';

interface Item {
  name: string;
  price: string;
}

export default function ReceiptPage() {
  const [businessName, setBusinessName] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<Item[]>([{ name: '', price: '' }]);
  const [tax, setTax] = useState('');
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
  const total = (subtotal + taxVal).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPdfUrl(null);
    setLoading(true);
    try {
      const result = await generateReceipt({
        businessName,
        date,
        items,
        subtotal: subtotal.toFixed(2),
        tax: tax || '0',
        total,
      });
      setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${result.url}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Back */}
        <Link href="/" className="back-link">
          <ArrowLeft size={15} />
          Back
        </Link>

        {/* Header */}
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
            Add your items, apply tax, and download the PDF receipt.
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Business + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Business Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="Acme Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <hr className="divider" />

            {/* Items */}
            <div>
              <label className="label">Line Items</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 96px 36px', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '2px' }}>Item</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '2px' }}>Price</span>
                </div>

                {items.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 96px 36px', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Item name"
                      required
                      className="input"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      required
                      step="0.01"
                      min="0"
                      className="input"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        color: items.length === 1 ? 'var(--text-muted)' : 'var(--error)',
                        cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                        opacity: items.length === 1 ? 0.4 : 1,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                style={{
                  marginTop: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.83rem',
                  fontWeight: 500,
                  color: 'var(--accent-light)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  transition: 'opacity 0.2s',
                }}
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            <hr className="divider" />

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Subtotal</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="label" style={{ margin: 0 }}>Tax</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  style={{ width: '100px', textAlign: 'right' }}
                  placeholder="0.00"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Total</span>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--accent-light)',
                  }}
                >
                  ${total}
                </span>
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
                  Generate Receipt
                </>
              )}
            </button>
          </form>
        </div>

        {/* Success */}
        {pdfUrl && (
          <div className="alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--success)', marginBottom: '2px', fontSize: '0.9rem' }}>
                Receipt ready!
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your PDF has been generated.</p>
            </div>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'var(--success)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={14} />
              Download
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
