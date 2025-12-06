import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HeatmapData {
  hour: number;
  day: string;
  value: number; // 0-100 percentage
}

interface OccupancyHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

const getHeatColor = (value: number): string => {
  if (value >= 90) return 'bg-rose-500';
  if (value >= 70) return 'bg-orange-500';
  if (value >= 50) return 'bg-amber-500';
  if (value >= 30) return 'bg-emerald-500';
  if (value >= 10) return 'bg-emerald-400';
  return 'bg-emerald-300/50';
};

const getHeatOpacity = (value: number): string => {
  if (value >= 80) return 'opacity-100';
  if (value >= 60) return 'opacity-90';
  if (value >= 40) return 'opacity-80';
  if (value >= 20) return 'opacity-70';
  return 'opacity-60';
};

const OccupancyHeatmap = ({ data, title = "Weekly Occupancy Heatmap" }: OccupancyHeatmapProps) => {
  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      map.set(`${d.day}-${d.hour}`, d.value);
    });
    return map;
  }, [data]);

  const getValue = (day: string, hour: number): number => {
    return dataMap.get(`${day}-${hour}`) ?? 0;
  };

  // Find peak times
  const peakData = useMemo(() => {
    if (data.length === 0) return { peak: null, lowest: null };
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return {
      peak: sorted[0],
      lowest: sorted[sorted.length - 1],
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-4">
          {peakData.peak && (
            <Badge variant="outline" className="text-rose-400 border-rose-500/30">
              Peak: {peakData.peak.day} {peakData.peak.hour}:00 ({peakData.peak.value}%)
            </Badge>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header - Hours */}
          <div className="flex">
            <div className="w-12" /> {/* Spacer for day labels */}
            {hours.map(hour => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-muted-foreground pb-2"
              >
                {hour}:00
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-1">
            {days.map(day => (
              <div key={day} className="flex items-center gap-1">
                <div className="w-12 text-xs text-muted-foreground text-right pr-2">
                  {day}
                </div>
                {hours.map(hour => {
                  const value = getValue(day, hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="flex-1 aspect-square relative group"
                    >
                      <div
                        className={cn(
                          "w-full h-full rounded-sm transition-all duration-200",
                          "group-hover:ring-2 group-hover:ring-white/30 group-hover:scale-110 group-hover:z-10",
                          getHeatColor(value),
                          getHeatOpacity(value)
                        )}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/90 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {day} {hour}:00 - {value}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-muted-foreground">Low</span>
            <div className="flex gap-1">
              {[10, 30, 50, 70, 90].map(v => (
                <div
                  key={v}
                  className={cn(
                    "w-6 h-4 rounded-sm",
                    getHeatColor(v)
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-xs text-muted-foreground">Average Occupancy</p>
          <p className="text-xl font-bold text-primary">
            {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)}%
          </p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-xs text-muted-foreground">Busiest Day</p>
          <p className="text-xl font-bold text-rose-400">
            {days[days.indexOf(
              Object.entries(
                data.reduce((acc, d) => {
                  acc[d.day] = (acc[d.day] || 0) + d.value;
                  return acc;
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mon'
            )]}
          </p>
        </div>
        <div className="glass-card p-3 rounded-xl text-center">
          <p className="text-xs text-muted-foreground">Quietest Time</p>
          <p className="text-xl font-bold text-emerald-400">
            {peakData.lowest ? `${peakData.lowest.hour}:00` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OccupancyHeatmap;
