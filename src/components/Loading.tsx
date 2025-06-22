import { cn } from "@/lib/utils";

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-primary mx-auto my-10 size-10 animate-spin",
        className
      )}
    >
      <svg height="100%" className="size-full" viewBox="0 0 32 32" width="100%">
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          strokeWidth="4"
          className="stroke-current opacity-20"
        ></circle>
        <circle
          cx="16"
          cy="16"
          fill="none"
          r="14"
          strokeWidth="4"
          className="stroke-current"
          style={{
            strokeDasharray: "80px",
            strokeDashoffset: "60px",
          }}
        ></circle>
      </svg>
    </div>
  );
}
