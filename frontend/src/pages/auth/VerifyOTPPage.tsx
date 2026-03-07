import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtpApi } from '../../api/authApi';
import { toast } from '../../hooks/useToast';
import './Auth.css';

const VerifyOTPPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some((c) => !c)) return toast.error('Please enter all 6 digits');
    setIsLoading(true);
    try {
      await verifyOtpApi(email, code.join(''));
      toast.success('Email verified! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--centered">
      <div className="auth-box auth-box--wide">
        <div className="otp-icon">✉️</div>
        <div className="auth-header">
          <h2>Verify your email</h2>
          <p>We sent a 6-digit code to <strong>{email}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-grid">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={isLoading}>
            {isLoading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
