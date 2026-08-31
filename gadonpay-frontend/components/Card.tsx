export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded border border-border bg-surface ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-display text-base text-text">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-faint">{message}</p>;
}
