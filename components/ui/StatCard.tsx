import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const variantClasses = {
    default: 'border-primary/20 bg-primary/5',
    success: 'border-success/20 bg-success/5',
    warning: 'border-warning/20 bg-warning/5',
    error: 'border-error/20 bg-error/5',
    info: 'border-info/20 bg-info/5'
  };

  const valueClasses = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  };

  return (
    <div className={cn(
      'p-6 rounded-xl border transition-all duration-200 hover:shadow-lg',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-base-content/70 uppercase tracking-wider">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-base-content/50 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            trend.isPositive ? 'text-success' : 'text-error'
          )}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className={cn(
        'text-3xl font-bold',
        valueClasses[variant]
      )}>
        {value}
      </div>
    </div>
  );
} 