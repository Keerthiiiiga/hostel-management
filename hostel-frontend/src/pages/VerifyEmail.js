import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl   = searchParams.get('email') || '';

  const [email, setEmail]     = useState(emailFromUrl);
  const [otp, setOtp]         = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCool, setResendCool] = useState(0);

  useEffect(() => {
    if (emailFromUrl) startCooldown();
  }, []);

  const startCooldown = () => {
    setResendCool(30);
    const t = setInterval(() =>
      setResendCool(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      }), 1000);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post(`${API}/api/auth/verify-email`, { email, otp });
      setSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setSuccess('');
    try {
      await axios.post(`${API}/api/auth/resend-verify-otp`, { email });
      setSuccess('OTP resent! Check your email.');
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.');
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={S.title}>🏠 Hostel Management</h2>
        <p style={S.subtitle}>Verify your email</p>

        {error   && <div style={S.error}>⚠️ {error}</div>}
        {success && <div style={S.successBox}>{success}</div>}

        <form onSubmit={handleVerify}>

          {/* Show email input only if not coming from login redirect */}
          {!emailFromUrl && (
            <>
              <label style={S.label}>Email Address</label>
              <input
                style={S.input}
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </>
          )}

          {emailFromUrl && (
            <p style={S.desc}>
              Enter the OTP sent to <strong>{email}</strong>
            </p>
          )}

          <p style={S.devNote}>
            🛠 Dev mode: OTP is <strong>123456</strong> — check your terminal
          </p>

          <label style={S.label}>OTP Code</label>
          <input
            style={{ ...S.input, letterSpacing: '10px', fontSize: '22px', textAlign: 'center' }}
            type="text"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />

          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Verifying...' : '✅ Verify Email'}
          </button>

          <p style={S.resend}>
            Didn't receive it?{' '}
            <button
              type="button"
              style={S.resendBtn}
              onClick={handleResend}
              disabled={resendCool > 0}
            >
              {resendCool > 0 ? `Resend in ${resendCool}s` : 'Resend OTP'}
            </button>
          </p>

        </form>

        <p style={S.footer}>
          Back to{' '}
          <span style={S.link} onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const S = {
  page:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#667eea,#764ba2)', fontFamily:'sans-serif' },
  card:       { background:'#fff', borderRadius:'20px', padding:'36px 40px', width:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' },
  title:      { fontWeight:800, fontSize:'22px', textAlign:'center', marginBottom:'4px', color:'#1e1e2e' },
  subtitle:   { textAlign:'center', color:'#6b7280', fontSize:'14px', marginBottom:'22px' },
  desc:       { fontSize:'13px', color:'#6b7280', textAlign:'center', marginBottom:'12px', lineHeight:'1.6' },
  devNote:    { background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#92400e', marginBottom:'14px', textAlign:'center' },
  error:      { background:'#fff3f3', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'14px' },
  successBox: { background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', marginBottom:'14px' },
  label:      { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'5px' },
  input:      { width:'100%', padding:'11px 13px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', marginBottom:'14px', outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
  btn:        { width:'100%', padding:'13px', background:'linear-gradient(90deg,#6366f1,#a855f7)', color:'#fff', border:'none', borderRadius:'12px', fontSize:'15px', fontWeight:700, cursor:'pointer', marginBottom:'10px' },
  resend:     { textAlign:'center', fontSize:'13px', color:'#9ca3af', margin:'8px 0 4px' },
  resendBtn:  { background:'none', border:'none', color:'#6366f1', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'13px' },
  footer:     { textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#6b7280' },
  link:       { color:'#6366f1', fontWeight:700, cursor:'pointer' },
};