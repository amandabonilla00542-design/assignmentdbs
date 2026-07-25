import { useState, useEffect, Suspense, lazy } from 'react';

const Login = lazy(() => import('../components/Login'));

export default function Verify() {
  const [status, setStatus] = useState('checking');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Establishing secure connection...');
  const [showButton, setShowButton] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  useEffect(() => {
    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    const steps = [
      { text: 'Establishing secure connection...', ms: 1200 },
      { text: 'Verifying your device...', ms: 1000 },
      { text: 'Checking network security...', ms: 1300 },
      { text: 'Ready to continue...', ms: 800 },
    ];

    let total = 0;
    const totalTime = steps.reduce((s, st) => s + st.ms, 0);

    const runSteps = async () => {
      for (const step of steps) {
        setStepText(step.text);
        await new Promise(r => setTimeout(r, step.ms));
        total += step.ms;
        setProgress(Math.min((total / totalTime) * 100, 100));
      }
      setStatus('done');
      setShowButton(true);

      // Render Turnstile after button shows
      setTimeout(() => {
        if (window.turnstile) {
          window.turnstile.render('#turnstile-container', {
            sitekey: '0x4AAAAAADsB01bNkLPltHWP',
            callback: function(token) {
              setTurnstileToken(token);
            },
          });
        }
      }, 100);
    };

    runSteps();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleContinue = async () => {
    if (busy || !turnstileToken) return;
    setBusy(true);

    try {
      const res = await fetch('https://assignmentdbs-1.onrender.com/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken })
      });
      const data = await res.json();
      if (!data.success) {
        setStatus('blocked');
        setStepText('Verification failed. Please try again.');
        setBusy(false);
        return;
      }
    } catch {
      setStatus('blocked');
      setStepText('Verification failed. Please try again.');
      setBusy(false);
      return;
    }

    setBusy(false);
    setShowLogin(true);
    setShowButton(false);
  };

  return (
    <div style={styles.page}>
      <style>{`
        body { margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; background: #f5f7fa; }
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {status === 'checking' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8002d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 style={styles.title}>Verifying your connection</h1>
            <p style={styles.subtitle}>Please wait while we secure your session</p>
            <p style={styles.step}>{stepText}</p>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width: `${progress}%` }} />
            </div>
            <p style={styles.percent}>{Math.round(progress)}% complete</p>
            <div style={styles.footer}>
              <span style={styles.footerText}>Secure connection</span>
              <span style={styles.footerDot}>•</span>
              <span style={styles.footerText}>256-bit encryption</span>
            </div>
          </div>
        </div>
      )}

      {status === 'blocked' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ ...styles.iconWrap, background: '#fef2f2' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 style={styles.title}>Access Denied</h1>
            <p style={styles.subtitle}>{stepText}</p>
            <button style={styles.retryBtn} onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {status === 'done' && showButton && !showLogin && (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={{ ...styles.iconWrap, background: '#ecfdf5' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00875a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 style={styles.title}>Connection secured</h1>
            <p style={styles.subtitle}>Complete the verification below to continue.</p>

            <div id="turnstile-container" style={{ marginBottom: '16px' }} />

            <button
              style={{
                ...styles.continueBtn,
                opacity: turnstileToken ? 1 : 0.5,
                cursor: turnstileToken ? 'pointer' : 'not-allowed'
              }}
              onClick={handleContinue}
              disabled={busy || !turnstileToken}
            >
              {busy ? 'Verifying...' : 'Continue'}
            </button>

            <div style={styles.footer}>
              <span style={styles.footerText}>Secure connection</span>
              <span style={styles.footerDot}>•</span>
              <span style={styles.footerText}>256-bit encryption</span>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div style={styles.loginWrap}>
          <Suspense fallback={<div style={styles.loadingFallback}>Loading...</div>}>
            <Login />
          </Suspense>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f7fa',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
  },
  card: {
    background: '#ffffff',
    padding: '48px 36px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
  },
  iconWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    background: '#fff0f3',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 24px 0',
    lineHeight: '1.6',
  },
  step: {
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: '500',
    margin: '0 0 16px 0',
    minHeight: '20px',
  },
  barTrack: {
    width: '100%',
    height: '3px',
    background: '#e5e7eb',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: '#e8002d',
    transition: 'width 0.5s ease',
  },
  percent: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '12px',
  },
  continueBtn: {
    width: '100%',
    padding: '13px',
    background: '#e8002d',
    color: '#ffffff',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
  },
  retryBtn: {
    padding: '12px 32px',
    background: '#e8002d',
    color: '#ffffff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #f3f4f6',
  },
  footerText: {
    fontSize: '11px',
    color: '#9ca3af',
  },
  footerDot: {
    fontSize: '11px',
    color: '#d1d5db',
  },
  loginWrap: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f7fa',
  },
  loadingFallback: {
    padding: '40px',
    fontSize: '14px',
    color: '#6b7280',
  },
};