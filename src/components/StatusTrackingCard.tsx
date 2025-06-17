import React from 'react';
import { cn } from "@/lib/utils";
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusTrackingCardProps {
  icon: ReactNode;
  count: number | string;
  label: string;
  sublabel?: string;
  className?: string;
  onClick: () => void;
}

export const StatusTrackingCard: React.FC<StatusTrackingCardProps> = ({
  icon,
  count,
  label,
  sublabel,
  className,
  onClick
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="mb-2">
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {count}
      </div>
      <span className="text-sm font-bold text-muted-foreground">
        {label}
      </span>
      {sublabel && (
        <span className="text-xs text-muted-foreground/70 mt-1">
          {sublabel}
        </span>
      )}
    </div>
  );
}; 