import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-sm bg-card p-3 sm:p-4 transition-all duration-300", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mr-2">
          {title}
        </span>
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-lg sm:text-2xl font-bold truncate text-foreground">{value}</span>
        {description && (
          <div className="flex items-center mt-1">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate leading-none">
              {description}
            </span>
            {trend && (
              <span className={cn(
                "ml-1 text-[9px] sm:text-[10px] font-bold leading-none shrink-0",
                trend.isPositive ? "text-primary" : "text-destructive"
              )}>
                {trend.isPositive ? "↑" : "↓"}{trend.value}%
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
