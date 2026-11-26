import React, { createContext, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const StudioContext = createContext(null);
export const useStudio = () => useContext(StudioContext);

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
    <div className="animate-rise mb-7 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-black shadow-lg"
            style={{ background: `linear-gradient(135deg, ${step.accent}, ${step.accent2})`, boxShadow: `0 10px 30px -10px ${step.accent}` }}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <span className="eyebrow">
            Stage {step.num} <span className="text-white/25">/ {String(total).padStart(2, '0')}</span>
          </span>
        </div>
        <h2 className="h-display text-gradient text-3xl leading-tight md:text-[40px]">{title}</h2>
        {desc && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/55">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StageNav({ prev, next, onGo }) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
      {prev ? (
        <button onClick={() => onGo(prev.id)} className="group flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition group-hover:border-white/30">
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span>
            <span className="eyebrow block">Back</span>
            <span className="text-sm font-semibold text-white/80">{prev.label}</span>
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button onClick={() => onGo(next.id)} className="group flex items-center gap-3 text-right">
          <span>
            <span className="eyebrow block">Next stage</span>
            <span className="text-sm font-semibold text-white">{next.label}</span>
          </span>
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-black transition group-hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${next.accent}, ${next.accent2})` }}
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
          <div className={`${h} rounded-md ring-1 ring-white/10`} style={{ background: c }} title={c} />
          {labels && <div className="mt-1 text-center font-mono text-[9px] text-white/40">{c}</div>}
        </div>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, children }) {
  return (
    <div className="glass-soft flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {Icon && <Icon className="h-7 w-7 text-white/30" />}
      <div className="font-display text-base font-semibold text-white/80">{title}</div>
      <div className="max-w-md text-sm text-white/45">{children}</div>
    </div>
  );
}
