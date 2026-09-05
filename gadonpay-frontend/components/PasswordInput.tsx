"use client";

import { useState, InputHTMLAttributes } from "react";
import { FieldWrapper } from "@/components/Input";

export function PasswordInput({
  label,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldWrapper label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className="w-full rounded border border-border bg-surface px-3 py-2 pr-16 text-sm text-text placeholder:text-faint focus:border-amber focus:outline-none"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-text"
        >
          {visible ? "Masquer" : "Afficher"}
        </button>
      </div>
    </FieldWrapper>
  );
}
