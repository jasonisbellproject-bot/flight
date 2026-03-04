'use client';

import { useState } from 'react';
import Link from 'next/link';
import AirportAutocomplete from '../../components/AirportAutocomplete';
import { Airport, generateItinerary } from '../../lib/api';
import { Plane, Download, ArrowLeft } from 'lucide-react';

export default function FlightPage() {
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [date, setDate] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [email, setEmail] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPdfUrl(null);

    if (!origin || !destination || !date || !passengerName || !email || !price) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await generateItinerary({
        passengerName,
        email,
        price,
        date,
        originId: origin.id,
        destinationId: destination.id,
      });
      setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${result.url}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
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
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: 'var(--accent-light)',
              marginBottom: '16px',
            }}
          >
            <Plane size={24} />
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
            Flight Itinerary
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Fill in the details below to generate your PDF itinerary.
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Passenger Name */}
            <div>
              <label className="label">Passenger Name</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. John Smith"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                required
                className="input"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Price */}
            <div>
              <label className="label">Total Price (USD)</label>
              <input
                type="number"
                required
                className="input"
                placeholder="e.g. 450.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            {/* Airports */}
            <AirportAutocomplete label="Origin Airport" onSelect={setOrigin} />
            <AirportAutocomplete label="Destination Airport" onSelect={setDestination} />

            {/* Date */}
            <div>
              <label className="label">Travel Date</label>
              <input
                type="date"
                required
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
                  <Plane size={16} />
                  Generate Itinerary
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
                Itinerary ready!
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
                transition: 'opacity 0.2s',
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
