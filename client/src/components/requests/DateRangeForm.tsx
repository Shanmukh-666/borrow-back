import React, { useState } from 'react';
import { getTodayString, getOffsetDateString } from '../../utils/date';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { Calendar, MessageSquare } from 'lucide-react';

export interface DateRangeFormProps {
  onSubmit: (startDate: string, endDate: string, message?: string) => Promise<void>;
  loading?: boolean;
}

export const DateRangeForm: React.FC<DateRangeFormProps> = ({ onSubmit, loading = false }) => {
  const today = getTodayString();
  const defaultEnd = getOffsetDateString(3);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate) {
      setError('Start date is required.');
      return;
    }

    if (!endDate) {
      setError('End date is required.');
      return;
    }

    if (startDate < today) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    try {
      await onSubmit(startDate, endDate, message.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Toast type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label htmlFor="start-date" className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
            Pickup Date <span className="text-appDanger">*</span>
          </label>
          <div className="relative">
            <input
              id="start-date"
              type="date"
              required
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-field border border-appBorder bg-surface text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label htmlFor="end-date" className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
            Return Date <span className="text-appDanger">*</span>
          </label>
          <div className="relative">
            <input
              id="end-date"
              type="date"
              required
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-field border border-appBorder bg-surface text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="req-message" className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
          Message for Owner (Optional)
        </label>
        <textarea
          id="req-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={300}
          placeholder="Introduce yourself or mention your project or intended use..."
          className="w-full px-3 py-2 rounded-field border border-appBorder bg-surface text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        />
        <div className="flex justify-between text-xs text-textMuted mt-1">
          <span>Max 300 characters.</span>
          <span>{message.length}/300</span>
        </div>
      </div>

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Confirm & Submit Request
      </Button>
    </form>
  );
};
