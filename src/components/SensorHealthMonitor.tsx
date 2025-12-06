import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryWarning,
  BatteryLow,
  Signal,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Thermometer,
  Activity,
  Radio
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SensorHealth {
  seatId: string;
  seatNumber: string;
  isOnline: boolean;
  batteryLevel: number;
  rssi: number;
  confidence: number;
  lastUpdate: Date;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
}

interface SensorHealthMonitorProps {
  sensors: SensorHealth[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SensorHealthMonitor = ({ 
  sensors, 
  onRefresh,
  isRefreshing = false 
}: SensorHealthMonitorProps) => {
  const [filter, setFilter] = useState<'all' | 'healthy' | 'warning' | 'critical' | 'offline'>('all');

  // Calculate overall health metrics
  const healthMetrics = {
    total: sensors.length,
    online: sensors.filter(s => s.isOnline).length,
    healthy: sensors.filter(s => s.status === 'healthy').length,
    warning: sensors.filter(s => s.status === 'warning').length,
    critical: sensors.filter(s => s.status === 'critical').length,
    offline: sensors.filter(s => !s.isOnline).length,
    avgBattery: Math.round(
      sensors.reduce((acc, s) => acc + s.batteryLevel, 0) / sensors.length
    ),
    avgSignal: Math.round(
      sensors.filter(s => s.isOnline).reduce((acc, s) => acc + s.rssi, 0) / 
      sensors.filter(s => s.isOnline).length
    ) || 0,
  };

  const filteredSensors = sensors.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'offline') return !s.isOnline;
    return s.status === filter;
  });

  const getStatusColor = (status: SensorHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'critical': return 'text-rose-400';
      case 'offline': return 'text-gray-400';
    }
  };

  const getStatusBg = (status: SensorHealth['status']) => {
    switch (status) {
      case 'healthy': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'warning': return 'bg-amber-500/20 border-amber-500/30';
      case 'critical': return 'bg-rose-500/20 border-rose-500/30';
      case 'offline': return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level <= 10) return <BatteryLow className="w-4 h-4 text-rose-400" />;
    if (level <= 30) return <BatteryWarning className="w-4 h-4 text-amber-400" />;
    return <Battery className="w-4 h-4 text-emerald-400" />;
  };

  const getSignalStrength = (rssi: number) => {
    if (rssi >= -50) return { label: 'Excellent', color: 'text-emerald-400', bars: 4 };
    if (rssi >= -60) return { label: 'Good', color: 'text-emerald-400', bars: 3 };
    if (rssi >= -70) return { label: 'Fair', color: 'text-amber-400', bars: 2 };
    return { label: 'Poor', color: 'text-rose-400', bars: 1 };
  };

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Online</span>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.online}/{healthMetrics.total}</p>
          <Progress 
            value={(healthMetrics.online / healthMetrics.total) * 100} 
            className="h-1 mt-2 bg-white/10"
          />
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Issues</span>
          </div>
          <p className="text-2xl font-bold">
            {healthMetrics.warning + healthMetrics.critical}
          </p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-amber-400">{healthMetrics.warning} warning</span>
            <span className="text-rose-400">{healthMetrics.critical} critical</span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Battery className="w-5 h-5" />
            <span className="text-sm font-medium">Avg Battery</span>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.avgBattery}%</p>
          <Progress 
            value={healthMetrics.avgBattery} 
            className={cn(
              "h-1 mt-2",
              healthMetrics.avgBattery > 50 && "bg-emerald-500/20",
              healthMetrics.avgBattery <= 50 && healthMetrics.avgBattery > 20 && "bg-amber-500/20",
              healthMetrics.avgBattery <= 20 && "bg-rose-500/20"
            )}
          />
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Radio className="w-5 h-5" />
            <span className="text-sm font-medium">Avg Signal</span>
          </div>
          <p className="text-2xl font-bold">{healthMetrics.avgSignal} dBm</p>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4].map(bar => (
              <div
                key={bar}
                className={cn(
                  "w-2 rounded-sm",
                  bar === 1 && "h-1",
                  bar === 2 && "h-2",
                  bar === 3 && "h-3",
                  bar === 4 && "h-4",
                  bar <= getSignalStrength(healthMetrics.avgSignal).bars 
                    ? getSignalStrength(healthMetrics.avgSignal).color.replace('text-', 'bg-')
                    : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'healthy', 'warning', 'critical', 'offline'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                filter === f && "bg-primary",
                filter !== f && "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {f === 'healthy' ? healthMetrics.healthy :
                   f === 'warning' ? healthMetrics.warning :
                   f === 'critical' ? healthMetrics.critical :
                   healthMetrics.offline}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Sensor List */}
      <ScrollArea className="h-[400px]">
        <div className="grid gap-3">
          {filteredSensors.map((sensor) => {
            const signal = getSignalStrength(sensor.rssi);
            const timeSinceUpdate = Math.round(
              (Date.now() - new Date(sensor.lastUpdate).getTime()) / 1000
            );

            return (
              <div
                key={sensor.seatId}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  getStatusBg(sensor.status)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      sensor.isOnline ? "bg-white/10" : "bg-gray-500/20"
                    )}>
                      {sensor.isOnline ? (
                        <Wifi className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Seat {sensor.seatNumber}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{sensor.seatId}</span>
                        <span>•</span>
                        <span>Updated {timeSinceUpdate}s ago</span>
                      </div>
                    </div>
                  </div>

                  <Badge className={cn(
                    "capitalize",
                    sensor.status === 'healthy' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    sensor.status === 'warning' && "bg-amber-500/20 text-amber-400 border-amber-500/30",
                    sensor.status === 'critical' && "bg-rose-500/20 text-rose-400 border-rose-500/30",
                    sensor.status === 'offline' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}>
                    {sensor.status}
                  </Badge>
                </div>

                {sensor.isOnline && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      {getBatteryIcon(sensor.batteryLevel)}
                      <div>
                        <p className="text-xs text-muted-foreground">Battery</p>
                        <p className="text-sm font-medium">{sensor.batteryLevel}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className={cn("w-4 h-4", signal.color)} />
                      <div>
                        <p className="text-xs text-muted-foreground">Signal</p>
                        <p className={cn("text-sm font-medium", signal.color)}>{signal.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className={cn(
                        "w-4 h-4",
                        sensor.confidence >= 0.9 && "text-emerald-400",
                        sensor.confidence >= 0.7 && sensor.confidence < 0.9 && "text-amber-400",
                        sensor.confidence < 0.7 && "text-rose-400"
                      )} />
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-sm font-medium">{Math.round(sensor.confidence * 100)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SensorHealthMonitor;
