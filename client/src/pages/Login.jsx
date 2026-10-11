import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogIn, ShieldAlert, User, ShieldCheck, Calculator } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const user = await login(email, password);
      // Route to user's dashboard based on role
      const redirectPath = location.state?.from?.pathname || (
        user.role === 'employee' ? '/employee/dashboard' :
        user.role === 'director' ? '/director/dashboard' :
        '/accounts/dashboard'
      );
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Instant login
    setSubmitting(true);
    login(demoEmail, demoPassword)
      .then((user) => {
        const dest = user.role === 'employee' ? '/employee/dashboard' :
                     user.role === 'director' ? '/director/dashboard' :
                     '/accounts/dashboard';
        navigate(dest, { replace: true });
      })
      .catch((err) => {
        setError(err.message || 'Quick login failed.');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 20
    }}>
      <div style={{
        maxWidth: 460,
        width: '100%',
        background: '#ffffff',
        borderRadius: 16,
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            color: '#fff',
            marginBottom: 12,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <Building2 size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            PRACHAY SECURITIES
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
            Expense Voucher Management Portal
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecdd3',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#b91c1c',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20
          }}>
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="e.g. employee@prachay.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: 8 }}
            disabled={submitting}
          >
            <LogIn size={16} />
            {submitting ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#64748b',
            display: 'block',
            textAlign: 'center',
            marginBottom: 12
          }}>
            Quick Demo Login (Select Role)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('employee@prachay.com', 'employee123')}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                padding: '8px 4px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8
              }}
            >
              <User size={15} color="#0369a1" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 4 }}>Employee</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Aarav S.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('director@prachay.com', 'director123')}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                padding: '8px 4px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8
              }}
            >
              <ShieldCheck size={15} color="#b45309" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 4 }}>Director</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Vikram M.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('accounts@prachay.com', 'accounts123')}
              className="btn btn-secondary btn-sm"
              style={{
                flexDirection: 'column',
                padding: '8px 4px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8
              }}
            >
              <Calculator size={15} color="#3730a3" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: 4 }}>Accounts</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Sunita R.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
