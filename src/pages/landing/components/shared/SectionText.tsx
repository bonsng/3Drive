import type { ReactNode } from 'react';

interface SectionTextProps {
  label?: string;
  title: string;
  description?: string;
  align: 'left' | 'right';
  className?: string;
  children?: ReactNode;
}

const alignClasses = {
  left: 'ml-8 md:ml-16 lg:ml-24',
  right: 'ml-auto mr-8 md:mr-16 lg:mr-24 text-right',
} as const;

export function SectionText({
  label,
  title,
  description,
  align,
  className = '',
  children,
}: SectionTextProps) {
  return (
    <div
      data-animate="text-reveal"
      className={`flex max-w-md flex-col gap-4 ${alignClasses[align]} ${className}`}
    >
      {label && (
        <span data-animate-child className="text-sm tracking-widest text-blue-400/70 uppercase">
          {label}
        </span>
      )}
      <h2
        data-animate-child
        className="text-4xl font-bold text-white md:text-5xl"
        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
      >
        {title}
      </h2>
      {description && (
        <p data-animate-child className="text-lg leading-relaxed text-white/60">
          {description}
        </p>
      )}
      {children && <div data-animate-child>{children}</div>}
    </div>
  );
}
