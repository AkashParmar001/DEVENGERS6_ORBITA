'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-1.5 p-1 bg-space-1 border border-space-4 rounded-xl overflow-x-auto", className)}>
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer",
              isActive
                ? "bg-space-3 text-frost border border-ice/30 shadow-[0_0_12px_rgba(99,212,255,0.15)]"
                : "text-mist hover:text-frost hover:bg-space-2/60"
            )}
          >
            {tab.icon && <span className={isActive ? "text-ice" : "text-mist"}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                isActive ? "bg-ice/20 text-ice" : "bg-space-4 text-mist"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
