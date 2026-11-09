import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none min-h-[44px] min-w-[44px]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];

  const variantClasses = {
    primary: 'bg-emerald-800 text-white hover:bg-emerald-900 active:bg-emerald-950 shadow-xs',
    secondary: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 active:bg-emerald-300',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100',
    danger: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 shadow-xs',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>লোড হচ্ছে...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs ${
        hoverable ? 'hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'pqc';
  className?: string;
}> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200 font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    pqc: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {children}
    </span>
  );
};

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'লোড হচ্ছে...' }) => (
  <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
    <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 gap-3">
    {icon && <div className="text-slate-400 p-3 bg-white rounded-full shadow-xs">{icon}</div>}
    <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
