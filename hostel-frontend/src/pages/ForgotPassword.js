import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { isAllowedEmail, getDomainError } from '../utils/validateEmail';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp]     = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCool, setResendCool] = useState(0);

  const startCooldown = () => {
    setResendCool(30);
    const t = setInterval(() => setResendCool(s => { if (s <= 1) { clearInterval(t); return 0; } return s - 1; }), 1000);
  };

  const handleSendOtp = async () => {
    setError('');
    if (!isAllowedEmail(email)) { setError(getDomainError(email)); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      setStep(2); startCooldown();
    } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    setError(''); setLoading(true);
    try {
      await axios.post(`${API}/api/auth/verify-reset-otp`, { email, otp });
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP.'); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    setError('');
    if (newPw !== confPw) { setError('Passwords do not match.'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/reset-password`, { email, otp, newPassword: newPw });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setError(err.response?.data?.message || 'Reset failed.'); }
    finally { setLoading(false); }
  };

  const STEPS = ['Email', 'OTP', 'New Password'];

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={S.title}>🏠 Hostel Management</h2>

        {/* Step Indicator */}
        <div style={S.steps}>
          {STEPS.map((s, i) => (
            <div key={i} style={S.stepItem}>
              <div style={{ ...S.stepCircle, ...(step > i + 1 ? S.stepDone : step === i + 1 ? S.stepCurrent : S.stepPending) }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ ...S.stepText, color: step === i + 1 ? '#4f46e5' : '#9ca3af' }}>{s}</span>
            </div>
          ))}
        </div>

        {error   && <div style={S.error}>⚠️ {error}</div>}
        {success && <div style={S.successBox}>{success}</div>}

        {/* Step 1 */}
        {step === 1 && (
          <>
            <p style={S.desc}>Enter your registered email to receive a reset OTP.</p>
            <label style={S.label}>Email Address</label>
            <input style={S.input} type="email" placeholder="you@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)} />
            <button style={S.btn} onClick={handleSendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP →'}
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <p style={S.desc}>
              Enter the OTP sent to <strong>{email}</strong>
              {process.env.NODE_ENV !== 'production' &&
                <span style={{ display:'block', color:'#f59e0b', marginTop:'4px' }}>🛠 Dev: use <strong>123456</strong></span>
              }
            </p>
            <label style={S.label}>OTP Code</label>
            <input style={{ ...S.input, letterSpacing:'10px', fontSize:'22px', textAlign:'center' }}
              type="text" maxLength={6} placeholder="123456"
              value={otp} onChange={e => setOtp(e.target.value)} />
            <button style={S.btn} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
            <p style={S.resend}>
              <button style={S.resendBtn} onClick={handleSendOtp} disabled={resendCool > 0}>
                {resendCool > 0 ? `Resend in ${resendCool}s` : 'Resend OTP'}
              </button>
            </p>
            <button style={S.backBtn} onClick={() => { setStep(1); setError(''); }}>← Back</button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <p style={S.desc}>Create your new password.</p>
            <label style={S.label}>New Password</label>
            <input style={S.input} type="password" placeholder="Min 6 characters"
              value={newPw} onChange={e => setNewPw(e.target.value)} />
            <label style={S.label}>Confirm Password</label>
            <input style={S.input} type="password" placeholder="Repeat password"
              value={confPw} onChange={e => setConfPw(e.target.value)} />
            <button style={S.btn} onClick={handleReset} disabled={loading}>
              {loading ? 'Resetting...' : '✅ Reset Password'}
            </button>
          </>
        )}

        <p style={S.footer}>
          <Link to="/login" style={S.link}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page:        { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#667eea,#764ba2)', fontFamily:'sans-serif' },
  card:        { background:'#fff', borderRadius:'20px', padding:'36px 40px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' },
  title:       { fontWeight:800, fontSize:'22px', textAlign:'center', marginBottom:'20px', color:'#1e1e2e' },
  steps:       { display:'flex', justifyContent:'center', alignItems:'flex-start', gap:'20px', marginBottom:'24px' },
  stepItem:    { display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' },
  stepCircle:  { width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px' },
  stepCurrent: { background:'#6366f1', color:'#fff' },
  stepDone:    { background:'#22c55e', color:'#fff' },
  stepPending: { background:'#e5e7eb', color:'#9ca3af' },
  stepText:    { fontSize:'11px', fontWeight:600 },
  desc:        { fontSize:'13px', color:'#6b7280', textAlign:'center', marginBottom:'16px', lineHeight:'1.6' },
  error:       { background:'#fff3f3', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'14px' },
  successBox:  { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'14px' },
  label:       { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'5px' },
  input:       { width:'100%', padding:'11px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', marginBottom:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  btn:         { width:'100%', padding:'13px', background:'linear-gradient(90deg,#6366f1,#a855f7)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:700, cursor:'pointer', marginBottom:'10px' },
  backBtn:     { width:'100%', padding:'10px', background:'none', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'13px', cursor:'pointer', color:'#6b7280', fontFamily:'inherit' },
  resend:      { textAlign:'center', fontSize:'13px', color:'#9ca3af', margin:'6px 0 10px' },
  resendBtn:   { background:'none', border:'none', color:'#6366f1', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'13px' },
  footer:      { textAlign:'center', marginTop:'16px', fontSize:'13px' },
  link:        { color:'#6366f1', fontWeight:700, textDecoration:'none' },
};