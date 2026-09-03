"use client";

import { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldWrapperProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-faint focus:border-amber focus:outline-none";

type FieldLabelProps = Pick<FieldWrapperProps, "label" | "error">;

export function Input({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldLabelProps) {
  return (
    <FieldWrapper label={label} error={error}>
      <input className={inputClass} {...props} />
    </FieldWrapper>
  );
}

export function Select({
  label,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldLabelProps & { children: React.ReactNode }) {
  return (
    <FieldWrapper label={label} error={error}>
      <select className={inputClass} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
