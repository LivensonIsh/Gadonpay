export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded border border-border bg-bg p-4 text-xs text-text">
      <code className="font-mono">{children}</code>
    </pre>
  );
}
