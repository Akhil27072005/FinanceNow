import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Mail, Lock, Eye, EyeOff, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Icon } from '@iconify/react';
import Button from '../components/ui/Button';

/**
 * Register Page - Modern split-screen design
 */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await register(formData.name, formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  const slides = [
    {
      title: 'Welcome!',
      subtitle: 'Start managing your finance faster and better'
    },
    {
      title: 'Track Everything',
      subtitle: 'Monitor all your transactions in one place'
    },
    {
      title: 'Smart Analytics',
      subtitle: 'Get insights into your spending patterns'
    }
  ];

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
        position: 'relative',
        overflow: 'hidden'
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

        {/* Dashboard Cards */}
        <div style={{ 
          position: 'relative', 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Current Balance Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            width: '280px',
            position: 'relative',
            zIndex: 3,
            alignSelf: 'flex-start',
            marginLeft: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon icon="mdi:wallet" style={{ fontSize: '18px', color: '#2563EB' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>
                CURRENT BALANCE
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#2563EB' }}>
              ₹24,359
            </div>
          </div>

          {/* Cards Container - Side by Side */}
          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            {/* New Transaction Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              border: '2px dashed #E5E7EB',
              width: '260px',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon icon="mdi:plus" style={{ fontSize: '24px', color: '#2563EB' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                  New transaction
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  or upload .xls file
                </div>
              </div>
            </div>

            {/* Donut Chart Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              width: '240px',
              position: 'relative',
              zIndex: 1
            }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
              {/* Simplified donut chart representation */}
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="20"
                  strokeDasharray={`${34 * 3.14} ${100 * 3.14}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="20"
                  strokeDasharray={`${25 * 3.14} ${100 * 3.14}`}
                  strokeDashoffset={`-${34 * 3.14}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="20"
                  strokeDasharray={`${20 * 3.14} ${100 * 3.14}`}
                  strokeDashoffset={`-${59 * 3.14}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                  strokeDasharray={`${21 * 3.14} ${100 * 3.14}`}
                  strokeDashoffset={`-${79 * 3.14}`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>34%</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Food</div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div style={{ marginTop: 'auto', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '12px',
            lineHeight: '1.2'
          }}>
            {slides[currentSlide].title}
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            style={{
              background: 'transparent',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentSlide ? '#2563EB' : '#E5E7EB',
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
            style={{
              background: 'transparent',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
              Welcome!
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6B7280',
              margin: 0
            }}>
              Start managing your finance faster and better
            </p>
          </div>

          {error && (
            <Alert variant="danger" style={{ marginBottom: '24px', borderRadius: '8px' }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <User
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '16px',
                    color: '#9CA3AF',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
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

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 8 characters"
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
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
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

            {/* Register Button */}
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
              Register
            </Button>
          </Form>

          {/* Separator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
            <span style={{
              padding: '0 16px',
              color: '#6B7280',
              fontSize: '14px'
            }}>
              or
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#111827',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <Icon icon="logos:google-icon" style={{ fontSize: '20px' }} />
              <span>Google</span>
            </button>
          </div>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
              Already have an account?{' '}
            </span>
            <Link
              to="/login"
              style={{
                color: '#2563EB',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Login
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

export default Register;
