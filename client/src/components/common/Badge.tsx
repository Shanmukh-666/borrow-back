import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'brand'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    brand: 'bg-teal-50 text-teal-800 border border-teal-200',
    success: 'bg-green-50 text-green-800 border border-green-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const ConditionBadge: React.FC<{ condition: string; size?: 'sm' | 'md' }> = ({ condition, size = 'md' }) => {
  switch (condition) {
    case 'New':
      return <Badge variant="brand" size={size}>New</Badge>;
    case 'Like New':
      return <Badge variant="success" size={size}>Like New</Badge>;
    case 'Good':
      return <Badge variant="info" size={size}>Good</Badge>;
    case 'Fair':
      return <Badge variant="warning" size={size}>Fair</Badge>;
    default:
      return <Badge variant="default" size={size}>{condition}</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="warning" size={size}>Pending Approval</Badge>;
    case 'approved':
      return <Badge variant="info" size={size}>Approved (Pickup Pending)</Badge>;
    case 'borrowed':
      return <Badge variant="brand" size={size}>Borrowed (Active)</Badge>;
    case 'return_pending':
      return <Badge variant="warning" size={size}>Return Pending</Badge>;
    case 'completed':
      return <Badge variant="success" size={size}>Completed</Badge>;
    case 'rejected':
      return <Badge variant="danger" size={size}>Rejected</Badge>;
    case 'cancelled':
      return <Badge variant="neutral" size={size}>Cancelled</Badge>;
    case 'active':
      return <Badge variant="success" size={size}>Active</Badge>;
    case 'archived':
      return <Badge variant="neutral" size={size}>Archived</Badge>;
    default:
      return <Badge variant="default" size={size}>{status}</Badge>;
  }
};
