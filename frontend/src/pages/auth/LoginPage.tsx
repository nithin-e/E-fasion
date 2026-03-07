import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { googleSignInApi } from '../../api/authApi';
import { toast } from '../../hooks/useToast';
import './Auth.css';

const LoginPage = () => {
  const { login, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    const emailTrimmed = form.email.trim();
    if (!emailTrimmed) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) e.email = 'Please enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]); // Show first error for login
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setError(msg);
      if (err.response?.data?.isVerified === false) {
        navigate(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;
    try {
      const res = await googleSignInApi(idToken);
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success(res.data.isNewUser ? 'Account created!' : 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Login</h2>
          <p>to access your account</p>
        </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input input-icon-pl"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input input-icon-pl input-icon-pr"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading}>
              {isLoading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Sign In'}
            </button>
          </form>

          {/* ─── Google Sign-In ─── */}
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="auth-google-btn">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-in failed')}
              width="100%"
              theme="outline"
              shape="pill"
              text="signin_with"
            />
          </div>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
    </div>
    </div>
  );
};

export default LoginPage;
