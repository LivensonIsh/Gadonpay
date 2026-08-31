"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export function Button({ variant = "primary", loading, className = "", children, disabled, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-amber text-bg hover:bg-amber/90",
    secondary: "bg-surfaceRaised text-text border border-border hover:border-borderLight",
    danger: "bg-rose-dim text-rose border border-rose/30 hover:bg-rose/10",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? "..." : children}
    </button>
  );
}
