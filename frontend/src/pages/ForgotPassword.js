import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import { authService } from '../services/authService';
import { Mail } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * Forgot Password Page - Modern split-screen design
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      setLoading(false);
      
      if (result.success) {
        setSuccess(result.message || 'If an account with that email exists, a password reset link has been sent.');
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to send reset email');
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
            Reset Your Password
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Right Panel - Forgot Password Form */}
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
              Forgot Password?
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: 0
            }}>
              No worries, we'll send you reset instructions.
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
            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Mail
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    color: '#9CA3AF',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    paddingLeft: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
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
              Send Reset Link
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

export default ForgotPassword;

