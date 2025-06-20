import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md',
  onClick
}: CardProps) {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-base-200 border border-base-content/8 shadow-modern',
    elevated: 'bg-base-200 border border-base-content/8 shadow-modern hover:shadow-modern-lg hover:border-base-content/12',
    outlined: 'bg-transparent border-2 border-primary/30 shadow-none hover:border-primary/50',
    glass: 'bg-base-200/60 border border-base-content/8 shadow-modern backdrop-blur-md'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        onClick && 'cursor-pointer hover:scale-[1.01]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CardTitle({ children, className, size = 'md' }: CardTitleProps) {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold'
  };

  return (
    <h3 className={cn(
      'text-base-content tracking-tight',
      sizeClasses[size],
      className
    )}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-base-content/70 text-sm mt-2 leading-relaxed', className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('flex items-center justify-between pt-6 border-t border-base-content/8', className)}>
      {children}
    </div>
  );
} 