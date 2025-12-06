import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Armchair, 
  Zap, 
  Volume2, 
  Sun, 
  Monitor,
  Accessibility,
  Wifi,
  WifiOff,
  Battery,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type SeatStatus = 'available' | 'reserved' | 'occupied' | 'offline' | 'maintenance' | 'selected';

export interface Seat {
  id: string;
  seatNumber: string;
  status: SeatStatus;
  rowPosition: number;
  colPosition: number;
  features: {
    hasWindow?: boolean;
    hasPowerOutlet?: boolean;
    isQuietZone?: boolean;
    hasMonitor?: boolean;
    isAccessible?: boolean;
  };
  sensorData?: {
    confidence: number;
    batteryLevel: number;
    rssi: number;
    isOnline: boolean;
    lastUpdate: Date;
  };
  reservation?: {
    userName: string;
    startTime: Date;
    endTime: Date;
  };
}

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect?: (seat: Seat) => void;
  selectedSeatId?: string | null;
  showSensorDetails?: boolean;
  isLoading?: boolean;
}

const statusColors: Record<SeatStatus, string> = {
  available: 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/50 hover:border-emerald-400 hover:from-emerald-500/30',
  reserved: 'from-amber-500/20 to-amber-600/30 border-amber-500/50',
  occupied: 'from-rose-500/20 to-rose-600/30 border-rose-500/50',
  offline: 'from-gray-500/20 to-gray-600/30 border-gray-500/50',
  maintenance: 'from-purple-500/20 to-purple-600/30 border-purple-500/50',
  selected: 'from-primary/30 to-primary/50 border-primary ring-2 ring-primary/50',
};

const statusIcons: Record<SeatStatus, React.ReactNode> = {
  available: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  reserved: <Clock className="w-3 h-3 text-amber-400" />,
  occupied: <XCircle className="w-3 h-3 text-rose-400" />,
  offline: <WifiOff className="w-3 h-3 text-gray-400" />,
  maintenance: <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />,
  selected: <CheckCircle2 className="w-3 h-3 text-primary" />,
};

const SeatMap = ({ 
  seats, 
  onSeatSelect, 
  selectedSeatId,
  showSensorDetails = false,
  isLoading = false 
}: SeatMapProps) => {
  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const row = seat.rowPosition;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  // Sort seats within each row by column
  Object.values(rows).forEach(row => {
    row.sort((a, b) => a.colPosition - b.colPosition);
  });

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available' && onSeatSelect) {
      onSeatSelect(seat);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading seat map...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 glass-card rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500/40 to-emerald-600/50 border border-emerald-500/50" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-500/40 to-amber-600/50 border border-amber-500/50" />
          <span className="text-sm text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-500/40 to-rose-600/50 border border-rose-500/50" />
          <span className="text-sm text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-500/40 to-gray-600/50 border border-gray-500/50" />
          <span className="text-sm text-muted-foreground">Offline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-primary/40 to-primary/60 border border-primary ring-2 ring-primary/30" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
      </div>

      {/* Front indicator */}
      <div className="text-center">
        <div className="inline-block px-6 py-2 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-full border border-primary/30">
          <span className="text-sm font-medium text-primary">FRONT / WHITEBOARD</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex flex-col items-center gap-3">
        {Object.entries(rows)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([rowNum, rowSeats]) => (
            <div key={rowNum} className="flex items-center gap-2">
              {/* Row label */}
              <div className="w-8 h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                {String.fromCharCode(65 + Number(rowNum))}
              </div>
              
              {/* Seats */}
              <div className="flex gap-2">
                {rowSeats.map((seat, idx) => {
                  const isSelected = selectedSeatId === seat.id;
                  const displayStatus = isSelected ? 'selected' : seat.status;
                  const isClickable = seat.status === 'available';

                  return (
                    <Tooltip key={seat.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleSeatClick(seat)}
                          disabled={!isClickable}
                          className={cn(
                            "relative w-14 h-14 rounded-xl border-2 transition-all duration-300",
                            "bg-gradient-to-br flex flex-col items-center justify-center gap-0.5",
                            statusColors[displayStatus],
                            isClickable && "cursor-pointer hover:scale-105 hover:shadow-lg",
                            !isClickable && "cursor-not-allowed opacity-80",
                            isSelected && "scale-105 shadow-lg shadow-primary/30"
                          )}
                        >
                          <Armchair className={cn(
                            "w-5 h-5",
                            displayStatus === 'available' && "text-emerald-400",
                            displayStatus === 'reserved' && "text-amber-400",
                            displayStatus === 'occupied' && "text-rose-400",
                            displayStatus === 'offline' && "text-gray-400",
                            displayStatus === 'maintenance' && "text-purple-400",
                            displayStatus === 'selected' && "text-primary",
                          )} />
                          <span className="text-[10px] font-medium">{seat.seatNumber}</span>
                          
                          {/* Status indicator */}
                          <div className="absolute -top-1 -right-1">
                            {statusIcons[displayStatus]}
                          </div>

                          {/* Feature indicators */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {seat.features.hasPowerOutlet && (
                              <Zap className="w-2.5 h-2.5 text-yellow-400" />
                            )}
                            {seat.features.hasWindow && (
                              <Sun className="w-2.5 h-2.5 text-orange-400" />
                            )}
                            {seat.features.isQuietZone && (
                              <Volume2 className="w-2.5 h-2.5 text-blue-400" />
                            )}
                          </div>

                          {/* Sensor signal indicator */}
                          {showSensorDetails && seat.sensorData && (
                            <div className="absolute -top-1 -left-1">
                              {seat.sensorData.isOnline ? (
                                <Wifi className={cn(
                                  "w-3 h-3",
                                  seat.sensorData.rssi > -60 && "text-emerald-400",
                                  seat.sensorData.rssi <= -60 && seat.sensorData.rssi > -75 && "text-amber-400",
                                  seat.sensorData.rssi <= -75 && "text-rose-400"
                                )} />
                              ) : (
                                <WifiOff className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="glass-card border-white/20 p-3 max-w-xs">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Seat {seat.seatNumber}</span>
                            <Badge variant={
                              seat.status === 'available' ? 'default' :
                              seat.status === 'reserved' ? 'secondary' :
                              seat.status === 'occupied' ? 'destructive' :
                              'outline'
                            }>
                              {seat.status}
                            </Badge>
                          </div>
                          
                          {/* Features */}
                          <div className="flex flex-wrap gap-1">
                            {seat.features.hasPowerOutlet && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Zap className="w-3 h-3" /> Power
                              </Badge>
                            )}
                            {seat.features.hasWindow && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Sun className="w-3 h-3" /> Window
                              </Badge>
                            )}
                            {seat.features.isQuietZone && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Volume2 className="w-3 h-3" /> Quiet
                              </Badge>
                            )}
                            {seat.features.hasMonitor && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Monitor className="w-3 h-3" /> Monitor
                              </Badge>
                            )}
                            {seat.features.isAccessible && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Accessibility className="w-3 h-3" /> Accessible
                              </Badge>
                            )}
                          </div>

                          {/* Sensor data */}
                          {showSensorDetails && seat.sensorData && (
                            <div className="pt-2 border-t border-white/10 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Confidence:</span>
                                <span className={cn(
                                  seat.sensorData.confidence >= 0.9 && "text-emerald-400",
                                  seat.sensorData.confidence >= 0.7 && seat.sensorData.confidence < 0.9 && "text-amber-400",
                                  seat.sensorData.confidence < 0.7 && "text-rose-400"
                                )}>
                                  {Math.round(seat.sensorData.confidence * 100)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Signal:</span>
                                <span>{seat.sensorData.rssi} dBm</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Battery:</span>
                                <div className="flex items-center gap-1">
                                  <Battery className={cn(
                                    "w-3 h-3",
                                    seat.sensorData.batteryLevel > 50 && "text-emerald-400",
                                    seat.sensorData.batteryLevel <= 50 && seat.sensorData.batteryLevel > 20 && "text-amber-400",
                                    seat.sensorData.batteryLevel <= 20 && "text-rose-400"
                                  )} />
                                  <span>{seat.sensorData.batteryLevel}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Reservation info */}
                          {seat.reservation && (
                            <div className="pt-2 border-t border-white/10 text-xs">
                              <p className="text-muted-foreground">Reserved by: {seat.reservation.userName}</p>
                              <p className="text-muted-foreground">
                                {new Date(seat.reservation.startTime).toLocaleTimeString()} - 
                                {new Date(seat.reservation.endTime).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Row label (right side) */}
              <div className="w-8 h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                {String.fromCharCode(65 + Number(rowNum))}
              </div>
            </div>
          ))}
      </div>

      {/* Column numbers */}
      <div className="flex justify-center">
        <div className="w-8" /> {/* Spacer for row labels */}
        <div className="flex gap-2">
          {rows[0]?.map((_, idx) => (
            <div key={idx} className="w-14 text-center text-sm text-muted-foreground">
              {idx + 1}
            </div>
          ))}
        </div>
        <div className="w-8" /> {/* Spacer for row labels */}
      </div>
    </div>
  );
};

export default SeatMap;
