import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
  className,
  trend
}: StatCardProps) {
  const variantClasses = {
    default: 'bg-base-200 border-base-content/8',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-warning/5 border-warning/20',
    error: 'bg-error/5 border-error/20',
    info: 'bg-info/5 border-info/20'
  };

  const iconColors = {
    default: 'text-base-content/60',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  };

  const valueColors = {
    default: 'text-base-content',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  };

  return (
    <div className={cn(
      'p-6 rounded-xl border shadow-modern transition-all duration-200 hover:shadow-modern-lg',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                variant === 'default' ? 'bg-base-content/5' : `bg-${variant}/10`
              )}>
                <div className={cn('w-5 h-5', iconColors[variant])}>
                  {icon}
                </div>
              </div>
            )}
            <h3 className="text-sm font-medium text-base-content/70 tracking-wide uppercase">
              {title}
            </h3>
          </div>
          
          <div className="space-y-1">
            <p className={cn(
              'text-3xl font-bold tracking-tight',
              valueColors[variant]
            )}>
              {value}
            </p>
            
            {description && (
              <p className="text-sm text-base-content/60">
                {description}
              </p>
            )}
            
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  trend.isPositive 
                    ? 'bg-success/10 text-success' 
                    : 'bg-error/10 text-error'
                )}>
                  <span className={cn(
                    'text-xs',
                    trend.isPositive ? '↗' : '↘'
                  )}>
                    {trend.isPositive ? '↗' : '↘'}
                  </span>
                  {Math.abs(trend.value)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 