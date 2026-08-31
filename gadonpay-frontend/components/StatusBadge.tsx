import type { PaymentStatus } from "@/lib/types";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/format";

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
