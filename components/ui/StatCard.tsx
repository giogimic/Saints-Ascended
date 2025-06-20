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
    default: 'bg-cyber-panel border-matrix-700',
    success: 'bg-cyber-panel border-matrix-500',
    warning: 'bg-cyber-panel border-warning-orange',
    error: 'bg-cyber-panel border-danger-red',
    info: 'bg-cyber-panel border-info-blue'
  };

  const iconColors = {
    default: 'text-matrix-600',
    success: 'text-matrix-500',
    warning: 'text-warning-orange',
    error: 'text-danger-red',
    info: 'text-info-blue'
  };

  const valueColors = {
    default: 'text-matrix-500',
    success: 'text-matrix-500',
    warning: 'text-warning-orange',
    error: 'text-danger-red',
    info: 'text-info-blue'
  };

  return (
    <div className={cn(
      'p-6 border-2 shadow-matrix transition-all duration-200 hover:shadow-matrix-glow cyber-hover',
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className={cn(
                'w-10 h-10 border flex items-center justify-center',
                variant === 'default' ? 'bg-cyber-panel border-matrix-700' : `bg-cyber-panel border-${variant === 'success' ? 'matrix-600' : variant === 'warning' ? 'warning-orange' : variant === 'error' ? 'danger-red' : 'info-blue'}`
              )}>
                <div className={cn('w-5 h-5', iconColors[variant])}>
                  {icon}
                </div>
              </div>
            )}
            <h3 className="text-sm font-mono font-medium text-matrix-600 tracking-widest uppercase">
              {title}
            </h3>
          </div>
          
          <div className="space-y-1">
            <p className={cn(
              'text-3xl font-bold font-mono tracking-wider',
              valueColors[variant]
            )}>
              {value}
            </p>
            
            {description && (
              <p className="text-sm text-matrix-600 font-mono">
                {description}
              </p>
            )}
            
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <div className={cn(
                  'flex items-center gap-1 px-2 py-1 border text-xs font-mono font-medium uppercase tracking-wider',
                  trend.isPositive 
                    ? 'bg-cyber-panel border-matrix-500 text-matrix-500' 
                    : 'bg-cyber-panel border-danger-red text-danger-red'
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