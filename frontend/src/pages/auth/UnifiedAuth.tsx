import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UnifiedAuth.css';

const AuthStep = {
  MOBILE: 'MOBILE',
  OTP: 'OTP',
  PROFILE: 'PROFILE'
} as const;

type AuthStepType = keyof typeof AuthStep;

const UnifiedAuth: React.FC = () => {
  const [step, setStep] = useState<AuthStepType>(AuthStep.MOBILE);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtp, completeSignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await sendOtp(mobile);
      if (data.otp) {
        // For development: auto-fill OTP and show message
        setOtp(data.otp);
        setError(`Development OTP: ${data.otp}`); // Using error-text styling for prominence
      }
      setStep(AuthStep.OTP);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { isNewUser } = await verifyOtp(mobile, otp);
      if (isNewUser) {
        setStep(AuthStep.PROFILE);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await completeSignup(name, email);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src="/assets/auth_banner.png" alt="Login" className="auth-image" />
        
        {step === AuthStep.MOBILE && (
          <form onSubmit={handleSendOtp}>
            <h2 className="auth-title">Login <span>or</span> Signup</h2>
            <div className="input-group">
              <span className="input-prefix">+91</span>
              <input 
                type="tel" 
                className="input-field" 
                placeholder="Mobile Number *" 
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            {error && <p className="error-text" style={{color: 'red', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}
            <p className="auth-terms">
              By continuing, I agree to the <a href="/terms">Terms of Use</a> & <a href="/privacy">Privacy Policy</a>
            </p>
            <button type="submit" className="auth-submit-btn" disabled={mobile.length !== 10 || loading}>
              {loading ? 'SENDING...' : 'CONTINUE'}
            </button>
            <p className="auth-help">Have trouble logging in? <a href="/help">Get help</a></p>
          </form>
        )}

        {step === AuthStep.OTP && (
          <form onSubmit={handleVerifyOtp}>
            <h2 className="auth-title">Verify OTP</h2>
            <p className="otp-sent-to">Sent to +91 {mobile}</p>
            <div className="input-group">
              <input 
                type="text" 
                className="input-field no-prefix" 
                placeholder="Enter OTP *" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            {error && <p className="error-text" style={{color: 'red', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}
            <button type="submit" className="auth-submit-btn" disabled={otp.length !== 6 || loading}>
              {loading ? 'VERIFYING...' : 'VERIFY'}
            </button>
            <button type="button" className="resend-otp" onClick={handleSendOtp}>RESEND OTP</button>
          </form>
        )}

        {step === AuthStep.PROFILE && (
          <form onSubmit={handleCompleteSignup}>
            <h2 className="auth-title">Complete your profile</h2>
            <div className="input-group">
              <input 
                type="text" 
                className="input-field no-prefix" 
                placeholder="Full Name *" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input 
                type="email" 
                className="input-field no-prefix" 
                placeholder="Email Address *" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-text" style={{color: 'red', fontSize: '12px', marginBottom: '10px'}}>{error}</p>}
            <button type="submit" className="auth-submit-btn" disabled={!name || !email || loading}>
              {loading ? 'SAVING...' : 'CREATE PROFILE'}
            </button>
          </form>
        )}

        <div className="social-login">
           <button className="google-btn">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
             Continue with Google
           </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuth;
