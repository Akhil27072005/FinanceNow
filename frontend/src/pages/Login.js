import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout, {
  AuthDivider,
  AuthGoogleButton,
  AuthSubmitButton
} from '../components/auth/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
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
      title="Welcome back"
      subtitle="Sign in to see expenses, budgets, and what's due this month."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/register"
    >
      {error ? <div className="auth-page__error">{error}</div> : null}

      <Form onSubmit={handleSubmit}>
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
              placeholder="Your password"
              required
              autoComplete="current-password"
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

        <Link to="/forgot-password" className="auth-page__forgot">
          Forgot password?
        </Link>

        <AuthSubmitButton loading={loading}>Log in</AuthSubmitButton>
      </Form>

      <AuthDivider />
      <AuthGoogleButton onClick={handleGoogleLogin} />
    </AuthLayout>
  );
};

export default Login;
