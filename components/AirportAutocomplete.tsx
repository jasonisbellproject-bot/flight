'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { searchAirports, Airport } from '../lib/api';

interface Props {
  label: string;
  onSelect: (airport: Airport) => void;
}

export default function AirportAutocomplete({ label, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selected) return;
    const timer = setTimeout(async () => {
      if (query.length >= 1) {
        setLoading(true);
        try {
          const data = await searchAirports(query);
          setResults(data);
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const handleSelect = (airport: Airport) => {
    setQuery(`${airport.city} (${airport.iata_code})`);
    setSelected(true);
    onSelect(airport);
    setIsOpen(false);
  };

  const handleChange = (value: string) => {
    setSelected(false);
    setQuery(value);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label className="label">{label}</label>
      <div style={{ position: 'relative' }}>
        {/* Search icon */}
        <div
          style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
          }}
        >
          <Search size={15} />
        </div>

        <input
          type="text"
          className="input"
          style={{ paddingLeft: '40px', paddingRight: loading ? '40px' : '12px' }}
          placeholder="Search city or IATA code…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length > 0 && !selected) setIsOpen(true); }}
        />

        {/* Spinner */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: '0 0 0 auto',
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="spinner" style={{ borderColor: 'rgba(99,102,241,0.3)', borderTopColor: 'var(--accent)' }} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            maxHeight: '240px',
            overflowY: 'auto',
            listStyle: 'none',
            padding: '6px',
          }}
        >
          {results.map((airport) => (
            <li
              key={airport.id}
              onClick={() => handleSelect(airport)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <MapPin size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {airport.city}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--accent-light)',
                      background: 'rgba(99,102,241,0.12)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    {airport.iata_code}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {airport.name} · {airport.country}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
