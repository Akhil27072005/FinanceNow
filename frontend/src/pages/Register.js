import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import AuthLayout, {
  AuthDivider,
  AuthGoogleButton,
  AuthSubmitButton
} from '../components/auth/AuthLayout';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  return (
    <AuthLayout
      title="Welcome to FinanceNow"
      subtitle="Start tracking spending, budgets, and subscriptions."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      {error ? <div className="auth-page__error">{error}</div> : null}

      <Form onSubmit={handleSubmit}>
        <div className="auth-page__field">
          <div className="auth-page__field-wrap">
            <User size={18} className="auth-page__field-icon" aria-hidden />
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="auth-page__field">
          <div className="auth-page__field-wrap">
            <Mail size={18} className="auth-page__field-icon" aria-hidden />
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="auth-page__field auth-page__field--password">
          <div className="auth-page__field-wrap">
            <Lock size={18} className="auth-page__field-icon" aria-hidden />
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-page__field-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="auth-page__field auth-page__field--password">
          <div className="auth-page__field-wrap">
            <Lock size={18} className="auth-page__field-icon" aria-hidden />
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-page__field-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <AuthSubmitButton loading={loading}>Sign up</AuthSubmitButton>
      </Form>

      <AuthDivider />
      <AuthGoogleButton onClick={handleGoogleLogin} />
    </AuthLayout>
  );
};

export default Register;
