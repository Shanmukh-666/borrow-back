import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 text-center max-w-md mx-auto space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand mx-auto">
        <HelpCircle className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">404 - Page Not Found</h1>
        <p className="text-sm text-textMuted mt-2 leading-relaxed">
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>
      </div>
      <div className="pt-2 flex justify-center gap-3">
        <Link to="/browse">
          <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Browse
          </Button>
        </Link>
      </div>
    </div>
  );
};
