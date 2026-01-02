import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import { authService } from '../services/authService';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * Reset Password Page - Modern split-screen design
 */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword(token, password);
      setLoading(false);
      
      if (result.success) {
        setSuccess('Password has been reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      backgroundColor: '#FFFFFF'
    }}>
      {/* Left Panel - Dashboard Preview */}
      <div style={{
        flex: '1',
        backgroundColor: '#F8FAFC',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 700
          }}>
            F
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            Finance Now
          </span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            Set New Password
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Enter your new password below to complete the reset process.
          </p>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        backgroundColor: '#FFFFFF'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Welcome Message */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '8px'
            }}>
              Reset Password
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: 0
            }}>
              Enter your new password below.
            </p>
          </div>

          {error && (
            <Alert variant="danger" style={{ marginBottom: '24px', borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" style={{ marginBottom: '24px', borderRadius: '8px' }}>
              {success}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    color: '#9CA3AF',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  required
                  minLength={6}
                  style={{
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9CA3AF'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    color: '#9CA3AF',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  style={{
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9CA3AF'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !token}
              loading={loading}
              style={{
                width: '100%',
                marginBottom: '24px',
                height: '48px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 500,
                fontSize: '15px',
                borderRadius: '8px',
                border: 'none'
              }}
            >
              Reset Password
            </Button>
          </Form>

          {/* Back to Login Link */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link
              to="/login"
              style={{
                color: '#2563EB',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              ← Back to Login
            </Link>
          </div>

          {/* Copyright */}
          <div style={{
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '12px'
          }}>
            © 2024 ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

