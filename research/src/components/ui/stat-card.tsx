import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  change?: string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  trend = "neutral",
  change,
  icon,
  description,
  className,
}: StatCardProps) => {
  const trendBadge =
    trend === "up" ? (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-medium text-success bg-success/8 px-1.5 py-0.5 rounded border border-success/15">
        +{change || ""}
      </span>
    ) : trend === "down" ? (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-medium text-danger bg-danger/8 px-1.5 py-0.5 rounded border border-danger/15">
        -{change || ""}
      </span>
    ) : null;

  return (
    <div
      className={cn(
        "panel p-4 hover:border-accent/20 hover:shadow-card-hover transition-all",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="label-mono">{title}</span>
        {icon && <div className="text-icon">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold font-mono text-navy tracking-tight">
          {value}
        </p>
        {trendBadge}
      </div>
      {description && (
        <p className="text-[10px] text-steel mt-1.5 font-mono">
          {description}
        </p>
      )}
    </div>
  );
};
