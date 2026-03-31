
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { isAllowedEmail, getDomainError } from '../utils/validateEmail';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]     = useState(1); // 1=form, 2=otp
  const [role, setRole]     = useState('student');
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp]       = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCool, setResendCool] = useState(0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Step 1: Register ───────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAllowedEmail(form.email)) { setError(getDomainError(form.email)); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, { ...form, role });
      setStep(2);
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/verify-email`, { email: form.email, otp });
      setSuccess('✅ Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally { setLoading(false); }
  };

  // ── Resend OTP ─────────────────────────────────────────────
  const handleResend = async () => {
    try {
      await axios.post(`${API}/api/auth/resend-verify-otp`, { email: form.email });
      setError('');
      setSuccess('OTP resent! Check your email.');
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.');
    }
  };

  const startResendCooldown = () => {
    setResendCool(30);
    const t = setInterval(() => setResendCool(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; }), 1000);
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={S.title}>🏠 Hostel Management</h2>
        <p style={S.subtitle}>{step === 1 ? 'Create your account' : 'Verify your email'}</p>

        {/* Role Toggle */}
        {step === 1 && (
          <div style={S.toggle}>
            {['student', 'warden'].map(r => (
              <button key={r} style={{ ...S.toggleBtn, ...(role === r ? S.toggleActive : {}) }}
                onClick={() => setRole(r)}>
                {r === 'student' ? '🎓' : '👮'} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        )}

        {error   && <div style={S.error}>⚠️ {error}</div>}
        {success && <div style={S.successBox}>✅ {success}</div>}

        {/* ── STEP 1: Registration Form ── */}
        {step === 1 && (
          <form onSubmit={handleRegister}>
            <label style={S.label}>Full Name</label>
            <input style={S.input} name="name" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />

            <label style={S.label}>Email Address</label>
            <input style={S.input} name="email" type="email"
              placeholder="you@gmail.com"
              value={form.email} onChange={handleChange} required />
            <p style={S.hint}>✅ Allowed: Gmail, Yahoo, Outlook, Hotmail, iCloud</p>

            <label style={S.label}>Password</label>
            <input style={S.input} name="password" type="password"
              placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required />

            <label style={S.label}>Confirm Password</label>
            <input style={S.input} name="confirmPassword" type="password"
              placeholder="Repeat password"
              value={form.confirmPassword} onChange={handleChange} required />

            <button style={S.btn} type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Register & Send OTP →'}
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 2 && (
          <form onSubmit={handleVerify}>
            <p style={S.desc}>
              We sent a 6-digit OTP to <strong>{form.email}</strong>.
              {process.env.NODE_ENV !== 'production' && (
                <span style={{ color: '#f59e0b', display: 'block', marginTop: '6px' }}>
                  🛠 Dev mode: Check your terminal. OTP is <strong>123456</strong>
                </span>
              )}
            </p>
            <label style={S.label}>OTP Code</label>
            <input style={{ ...S.input, letterSpacing: '10px', fontSize: '22px', textAlign: 'center' }}
              type="text" maxLength={6} placeholder="123456"
              value={otp} onChange={e => setOtp(e.target.value)} required />

            <button style={S.btn} type="submit" disabled={loading}>
              {loading ? 'Verifying...' : '✅ Verify Email'}
            </button>

            <p style={S.resend}>
              Didn't receive it?{' '}
              <button type="button" style={S.resendBtn}
                onClick={handleResend} disabled={resendCool > 0}>
                {resendCool > 0 ? `Resend in ${resendCool}s` : 'Resend OTP'}
              </button>
            </p>
            <button type="button" style={S.backBtn} onClick={() => { setStep(1); setError(''); }}>
              ← Change Email
            </button>
          </form>
        )}

        <p style={S.footer}>
          Already have an account? <Link to="/login" style={S.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#667eea,#764ba2)', fontFamily:'sans-serif' },
  card:       { background:'#fff', borderRadius:'20px', padding:'36px 40px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' },
  title:      { fontWeight:800, fontSize:'22px', textAlign:'center', marginBottom:'4px', color:'#1e1e2e' },
  subtitle:   { textAlign:'center', color:'#6b7280', fontSize:'14px', marginBottom:'22px' },
  toggle:     { display:'flex', gap:'10px', marginBottom:'20px' },
  toggleBtn:  { flex:1, padding:'11px', borderRadius:'12px', border:'1.5px solid #e5e7eb', background:'#fff', fontFamily:'inherit', fontSize:'14px', fontWeight:500, color:'#6b7280', cursor:'pointer' },
  toggleActive:{ borderColor:'#6366f1', background:'#eef2ff', color:'#4f46e5', fontWeight:700 },
  error:      { background:'#fff3f3', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'14px' },
  successBox: { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'14px' },
  label:      { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'5px' },
  input:      { width:'100%', padding:'11px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', marginBottom:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  hint:       { fontSize:'12px', color:'#6b7280', marginTop:'-10px', marginBottom:'12px' },
  btn:        { width:'100%', padding:'13px', background:'linear-gradient(90deg,#6366f1,#a855f7)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:700, cursor:'pointer', marginBottom:'12px' },
  backBtn:    { width:'100%', padding:'10px', background:'none', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', cursor:'pointer', color:'#6b7280', fontFamily:'inherit' },
  desc:       { fontSize:'13px', color:'#6b7280', marginBottom:'16px', lineHeight:'1.6', textAlign:'center' },
  resend:     { textAlign:'center', fontSize:'13px', color:'#9ca3af', margin:'8px 0 12px' },
  resendBtn:  { background:'none', border:'none', color:'#6366f1', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'13px' },
  footer:     { textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#6b7280' },
  link:       { color:'#6366f1', fontWeight:700, textDecoration:'none' },
};