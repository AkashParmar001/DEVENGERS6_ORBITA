import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border border-space-4 bg-space-2/90 text-frost backdrop-blur-md shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border-space-4 bg-space-2/90",
        glass: "border-ice/20 bg-space-1/80 shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
        glow: "border-ice/30 bg-space-2/95 shadow-[0_0_24px_rgba(99,212,255,0.08)]",
        interactive: "border-space-4 bg-space-2/90 hover:border-ice/40 hover:bg-space-3/90 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";
