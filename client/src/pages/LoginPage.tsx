import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const destination = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail, password);
      navigate(destination, { replace: true });
    } catch (err: any) {
      // Spec: Show a general credential error without revealing whether an email exists
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-16 flex items-center justify-center">
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
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">Sign in to BorrowBack</h1>
          <p className="text-xs text-textMuted">
            Access your borrowing requests, active loans, and listings.
          </p>
        </div>

        {error && <Toast type="error" message={error} onDismiss={() => setError(null)} />}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            required
            isPassword
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full pt-2.5">
            Sign in
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-textMuted pt-2 border-t border-appBorder">
          Don't have an account?{' '}
          <Link to="/register" state={{ from: (location.state as any)?.from }} className="text-brand font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
