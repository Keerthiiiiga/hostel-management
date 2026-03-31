
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const ALLOWED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.in',
  'outlook.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'rediffmail.com',
];

const isAllowedEmail = (email) => {
  if (!email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole]         = useState('student');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAllowedEmail(email)) {
      const domain = email.split('@')[1];
      setError(`"${domain}" is not allowed. Use Gmail, Yahoo, Outlook, etc.`);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password, role });

      // ✅ Store token separately
      localStorage.setItem("token", res.data.token);

      // ✅ Store user with _id included
      localStorage.setItem("user", JSON.stringify({
        _id:   res.data.user._id,
        name:  res.data.user.name,
        email: res.data.user.email,
        role:  res.data.user.role,
      }));

      // ✅ Redirect based on role
      const userRole = res.data.user.role;
      if (userRole === 'admin')       navigate('/admin');
      else if (userRole === 'warden') navigate('/warden');
      else                            navigate('/student');

    } catch (err) {
      const msg         = err.response?.data?.message || 'Login failed.';
      const needsVerify = err.response?.data?.needsVerification;

      if (needsVerify) {
        setError('Email not verified. Redirecting to verification...');
        setTimeout(() => navigate(`/verify-email?email=${email}`), 1500);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h2 style={S.title}>🏠 Hostel Management</h2>
        <p style={S.subtitle}>Sign in to your account</p>

        {/* Role Toggle */}
        <div style={S.toggle}>
          {['student', 'warden'].map(r => (
            <button
              key={r}
              type="button"
              style={{ ...S.toggleBtn, ...(role === r ? S.toggleActive : {}) }}
              onClick={() => setRole(r)}
            >
              {r === 'student' ? '🎓' : '👮'} {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {error && <div style={S.error}>⚠️ {error}</div>}

        <form onSubmit={handleLogin}>
          <label style={S.label}>Email Address</label>
          <input
            style={S.input}
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label style={S.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              style={S.input}
              type={showPw ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              style={S.eyeBtn}
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '18px' }}>
            <Link to="/forgot-password" style={S.forgotLink}>
              Forgot Password?
            </Link>
          </div>

          <button style={S.btn} type="submit" disabled={loading}>
            {loading
              ? 'Signing in...'
              : `Login as ${role === 'student' ? 'Student 🎓' : 'Warden 👮'}`
            }
          </button>
        </form>

        <p style={S.footer}>
          New user? <Link to="/register" style={S.link}>Create an account</Link>
        </p>
        <p style={{ ...S.footer, marginTop: '6px', color: '#9ca3af', fontSize: '12px' }}>
          Admin access is managed by system administrator
        </p>
      </div>
    </div>
  );
}

const S = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)', fontFamily: 'sans-serif' },
  card:        { background: '#fff', borderRadius: '20px', padding: '36px 44px', width: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' },
  title:       { fontWeight: 800, fontSize: '24px', textAlign: 'center', marginBottom: '4px', color: '#1e1e2e' },
  subtitle:    { textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '24px' },
  toggle:      { display: 'flex', gap: '10px', marginBottom: '22px' },
  toggleBtn:   { flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e5e7eb', background: '#fff', fontFamily: 'inherit', fontSize: '15px', fontWeight: 500, color: '#6b7280', cursor: 'pointer' },
  toggleActive:{ borderColor: '#6366f1', background: '#eef2ff', color: '#4f46e5', fontWeight: 700 },
  error:       { background: '#fff3f3', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' },
  label:       { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  input:       { width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', marginBottom: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  eyeBtn:      { position: 'absolute', right: '13px', top: '35%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  forgotLink:  { fontSize: '13px', color: '#6366f1', fontWeight: 600, textDecoration: 'none' },
  btn:         { width: '100%', padding: '14px', background: 'linear-gradient(90deg,#6366f1,#a855f7)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '20px' },
  footer:      { textAlign: 'center', fontSize: '14px', color: '#6b7280' },
  link:        { color: '#6366f1', fontWeight: 700, textDecoration: 'none' },
};