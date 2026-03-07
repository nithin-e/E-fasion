import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { registerApi } from '../../api/authApi';
import { googleSignInApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../hooks/useToast';
import './Auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    const emailTrimmed = form.email.trim();
    const mobileTrimmed = form.mobile.trim();
    const namePattern = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    if (!form.name) e.name = 'Full name is required';
    else if (!namePattern.test(form.name)) e.name = 'No leading/trailing spaces or numbers allowed';
    
    if (!emailTrimmed) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) e.email = 'Please enter a valid email';
    
    if (!mobileTrimmed) e.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(mobileTrimmed)) e.mobile = 'Mobile must be 10 digits';
    
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!form.password) e.password = 'Password is required';
    else if (!passwordPattern.test(form.password)) {
      e.password = 'Must be 8+ chars with uppercase, lowercase, number and special char';
    }
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsLoading(true);
    try {
      await registerApi(form);
      toast.success('Account created! Please verify your email.');
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
      toast.success(res.data.isNewUser ? 'Account created with Google!' : 'Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Google sign-up failed');
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [key]: e.target.value });
      if (errors[key]) setErrors({ ...errors, [key]: '' });
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-box auth-box--wide">
        <div className="auth-header">
          <h2>Sign Up</h2>
          <p>Create an account to start shopping</p>
        </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {[
              { key: 'name', label: 'Full Name', icon: <User size={16} />, type: 'text', placeholder: 'Jane Doe' },
              { key: 'email', label: 'Email', icon: <Mail size={16} />, type: 'email', placeholder: 'you@example.com' },
              { key: 'mobile', label: 'Mobile Number', icon: <Phone size={16} />, type: 'tel', placeholder: '9876543210' },
              { key: 'password', label: 'Password', icon: <Lock size={16} />, type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, icon, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className="input-icon-wrap">
                  <span className="input-icon">{icon}</span>
                  <input
                    type={type}
                    className={`form-input input-icon-pl ${errors[key] ? 'has-error' : ''}`}
                    placeholder={placeholder}
                    {...field(key as keyof typeof form)}
                  />
                </div>
                {errors[key] && <span className="form-error">{errors[key]}</span>}
              </div>
            ))}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading}>
              {isLoading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
            </button>
          </form>

          {/* ─── Google Sign-Up ─── */}
          <div className="auth-divider"><span>or sign up with</span></div>
          <div className="auth-google-btn">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google sign-up failed')}
              width="100%"
              theme="outline"
              shape="pill"
              text="signup_with"
            />
          </div>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
    </div>
    </div>
  );
};

export default RegisterPage;
