import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const dim = size === "small" ? 24 : 30;
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg width={dim} height={dim} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#E3A542" />
        <path
          d="M20 33L28 41L45 22"
          stroke="#0B0E14"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-display text-text ${size === "small" ? "text-base" : "text-lg"}`}>
        GadonPay
      </span>
    </Link>
  );
}
