import React from 'react';
import { RequestStatus } from '../../types/BorrowRequest';
import { StatusBadge } from '../common/Badge';

export const RequestStatusStepper: React.FC<{ status: RequestStatus }> = ({ status }) => {
  if (status === 'rejected' || status === 'cancelled') {
    return (
      <div className="flex items-center gap-2">
        <StatusBadge status={status} />
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Requested' },
    { key: 'approved', label: 'Approved' },
    { key: 'borrowed', label: 'Picked Up' },
    { key: 'completed', label: 'Returned' },
  ];

  const getStepState = (stepKey: string) => {
    const order = ['pending', 'approved', 'borrowed', 'return_pending', 'completed'];
    const currentIndex = order.indexOf(status);

    let stepIndex = 0;
    if (stepKey === 'pending') stepIndex = 0;
    if (stepKey === 'approved') stepIndex = 1;
    if (stepKey === 'borrowed') stepIndex = 2;
    if (stepKey === 'completed') stepIndex = 4;

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex || (stepKey === 'borrowed' && status === 'return_pending')) return 'current';
    return 'upcoming';
  };

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 z-0" />
        {steps.map((s) => {
          const state = getStepState(s.key);
          return (
            <div key={s.key} className="flex flex-col items-center relative z-10 bg-surface px-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  state === 'completed'
                    ? 'bg-appSuccess text-white'
                    : state === 'current'
                    ? 'bg-brand text-white ring-4 ring-teal-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {state === 'completed' ? '✓' : ''}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium ${
                  state === 'current' ? 'text-brand font-semibold' : 'text-textMuted'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
