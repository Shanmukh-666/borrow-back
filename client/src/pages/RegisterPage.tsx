import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { validateEmail, validatePassword } from '../utils/validation';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const destination = (location.state as any)?.from?.pathname || '/dashboard';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 60) {
      newErrors.name = 'Full name must be between 2 and 60 characters';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      newErrors.password = passCheck.message || 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate(destination, { replace: true });
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        const fieldErrors: Record<string, string> = {};
        err.details.forEach((d: any) => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      }
      setGeneralError(err.message || 'Registration failed. Please check the fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 flex items-center justify-center">
      <div className="w-full max-w-md bg-surface rounded-card border border-appBorder p-8 sm:p-10 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-textPrimary font-bold text-xl mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand">
              <Package2 className="w-5 h-5 text-brand" />
            </div>
            <span>
              Borrow<span className="text-brand">Back</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Create your account</h1>
          <p className="text-xs text-textMuted">
            Join your community to lend, borrow, and share useful resources.
          </p>
        </div>

        {generalError && (
          <Toast type="error" message={generalError} onDismiss={() => setGeneralError(null)} />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            autoComplete="name"
            placeholder="e.g. Alex Taylor"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
          />

          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
          />

          <Input
            label="Password"
            required
            isPassword
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            helperText="Minimum 8 characters with a mix of letters and numbers."
          />

          <Input
            label="Confirm password"
            required
            isPassword
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            error={errors.confirmPassword}
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full pt-3">
            Create account
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-textMuted pt-2 border-t border-appBorder">
          Already have an account?{' '}
          <Link to="/login" state={{ from: (location.state as any)?.from }} className="text-brand font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
