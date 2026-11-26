import React, { createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const StudioContext = createContext(null);
export const useStudio = () => useContext(StudioContext);

export const UI_THEMES = [
  { id: 'neutral', label: 'Neutral', sub: 'Graphite Darkroom', swatch: '#1A1A1D', dot: '#E06D3B' },
  { id: 'warm', label: 'Warm', sub: 'Analog 35mm', swatch: '#2A211B', dot: '#D97736' },
  { id: 'cool', label: 'Cool', sub: 'Cine Slate', swatch: '#161D27', dot: '#4B9FEA' },
  { id: 'bright', label: 'Bright', sub: 'Daylight Paper', swatch: '#F4F1EA', dot: '#C85228' }
];

export function Panel({ className = '', children, ...rest }) {
  return (
    <div className={`glass p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="sf-label">{label}</span>}
      {children}
    </label>
  );
}

export function SectionTitle({ eyebrow, title, right, className = '' }) {
  return (
    <div className={`mb-4 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h3 className="h-display text-lg">{title}</h3>
      </div>
      {right}
    </div>
  );
}

export function StageHeader({ step, total, title, desc, actions }) {
  const Icon = step.icon;
  return (
    <div className="animate-rise mb-7 flex flex-wrap items-end justify-between gap-5 border-b pb-5" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-3xl">
        <div className="mb-2.5 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <span className="eyebrow">
            Stage {step.num} <span style={{ color: 'var(--text-3)' }}>/ {String(total).padStart(2, '0')} · {step.label}</span>
          </span>
        </div>
        <h2 className="h-display text-2xl leading-tight md:text-3xl">{title}</h2>
        {desc && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StageNav({ prev, next, onGo }) {
  return (
    <div className="mt-10 flex items-center justify-between border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      {prev ? (
        <button onClick={() => onGo(prev.id)} className="group flex items-center gap-3 text-left">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border transition" style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}>
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span>
            <span className="eyebrow block">Previous</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{prev.label}</span>
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button onClick={() => onGo(next.id)} className="group flex items-center gap-3 text-right">
          <span>
            <span className="eyebrow block">Next stage</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{next.label}</span>
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg transition group-hover:translate-x-0.5"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      )}
    </div>
  );
}

export function Palette({ colors = [], size = 'md', labels = false }) {
  const h = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-9' : 'h-5';
  return (
    <div className="flex w-full gap-1">
      {colors.map((c, i) => (
        <div key={i} className="flex-1">
          <div className={`${h} rounded-sm border`} style={{ background: c, borderColor: 'var(--border)' }} title={c} />
          {labels && <div className="mt-1 text-center font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>{c}</div>}
        </div>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="glass-soft flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {Icon && <Icon className="h-7 w-7" style={{ color: 'var(--text-3)' }} />}
      <div className="font-display text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</div>
      <div className="max-w-md text-sm" style={{ color: 'var(--text-2)' }}>{children}</div>
    </div>
  );
}
