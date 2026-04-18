'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'granted');
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
      window.gtag('event', 'page_view', {
        send_to: 'G-XLRN3B9S2D',
      });
    }
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem('cookie_consent', 'denied');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#1a1a2e',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
        fontSize: '14px',
      }}
    >
      <p style={{ margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
        Ce site utilise des cookies pour mesurer l&apos;audience et améliorer votre expérience.{' '}
        <a href="/mentions-legales" style={{ color: '#C4996C', textDecoration: 'underline' }}>
          En savoir plus
        </a>
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={accept}
          style={{
            background: '#C4996C',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Accepter
        </button>
        <button
          onClick={refuse}
          style={{
            background: 'transparent',
            color: '#ccc',
            border: '1px solid #555',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
