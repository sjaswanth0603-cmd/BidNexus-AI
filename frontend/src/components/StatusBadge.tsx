import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  const upper = status.toUpperCase();

  if (upper === 'COMPLIANT' || upper === 'APPROVED') {
    return (
      <span className={`badge-compliant ${className}`}>
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
        <span>{upper === 'APPROVED' ? 'APPROVED (HUMAN)' : 'COMPLIANT'}</span>
      </span>
    );
  }

  if (upper === 'REVIEW_REQUIRED' || upper === 'REVIEW REQUIRED') {
    return (
      <span className={`badge-review ${className}`}>
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
        <span>REVIEW REQUIRED</span>
      </span>
    );
  }

  if (upper === 'NON_COMPLIANT' || upper === 'NON COMPLIANT' || upper === 'REJECTED') {
    return (
      <span className={`badge-noncompliant ${className}`}>
        {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
        <span>{upper === 'REJECTED' ? 'REJECTED (HUMAN)' : 'NON-COMPLIANT'}</span>
      </span>
    );
  }

  return (
    <span className={`badge-info ${className}`}>
      {showIcon && <Info className="w-3.5 h-3.5 text-sky-400" />}
      <span>{status}</span>
    </span>
  );
};
