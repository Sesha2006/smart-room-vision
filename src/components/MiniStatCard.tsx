import { LucideIcon } from "lucide-react";
import SparklineChart from "./SparklineChart";
import { cn } from "@/lib/utils";

interface MiniStatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  sparklineData: number[];
  color: string;
  delay?: number;
}

const MiniStatCard = ({ 
  title, 
  value, 
  unit,
  icon: Icon, 
  sparklineData,
  color,
  delay = 0
}: MiniStatCardProps) => {
  return (
    <div 
      className="glass-card-hover p-5 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <SparklineChart 
          data={sparklineData} 
          color={color}
          gradientId={`spark-${title.toLowerCase().replace(/\s/g, '-')}`}
        />
      </div>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
};

export default MiniStatCard;
