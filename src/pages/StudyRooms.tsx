import { useState, useEffect } from "react";
import SeatMap, { Seat, SeatStatus } from "@/components/SeatMap";
import ReservationModal from "@/components/ReservationModal";
import OccupancyHeatmap from "@/components/OccupancyHeatmap";
import { sensorSimulator, generateScenario } from "@/lib/mockSensorSimulator";
import { allocateSeat, calculateUtilization, UserPreferences } from "@/lib/seatAllocationEngine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  MapPin, Users, Zap, Clock, Sparkles, Activity, 
  Sun, Volume2, Monitor, Play, Pause, RefreshCw
} from "lucide-react";

// Generate mock seats
const generateMockSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = 5;
  const cols = 6;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
      const statuses: SeatStatus[] = ['available', 'available', 'available', 'reserved', 'occupied', 'offline'];
      
      seats.push({
        id: `seat-${row}-${col}`,
        seatNumber,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        rowPosition: row,
        colPosition: col,
        features: {
          hasWindow: col === 0 || col === cols - 1,
          hasPowerOutlet: row % 2 === 0,
          isQuietZone: row >= 3,
          hasMonitor: col === 2 || col === 3,
          isAccessible: row === 0 && (col === 0 || col === cols - 1),
        },
        sensorData: {
          confidence: 0.85 + Math.random() * 0.15,
          batteryLevel: 60 + Math.floor(Math.random() * 40),
          rssi: -45 - Math.floor(Math.random() * 30),
          isOnline: Math.random() > 0.1,
          lastUpdate: new Date(),
        },
      });
    }
  }
  return seats;
};

// Generate mock heatmap data
const generateHeatmapData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: { hour: number; day: string; value: number }[] = [];
  
  days.forEach(day => {
    for (let hour = 7; hour <= 21; hour++) {
      let baseValue = 20;
      if (hour >= 9 && hour <= 12) baseValue = 60;
      if (hour >= 14 && hour <= 17) baseValue = 75;
      if (day === 'Sat' || day === 'Sun') baseValue *= 0.5;
      
      data.push({
        day,
        hour,
        value: Math.min(100, Math.max(0, baseValue + Math.floor(Math.random() * 30 - 15))),
      });
    }
  });
  return data;
};

const StudyRooms = () => {
  const [seats, setSeats] = useState<Seat[]>(generateMockSeats());
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSensorDetails, setShowSensorDetails] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferWindow: false,
    preferQuiet: false,
    preferPowerOutlet: true,
  });

  const utilization = calculateUtilization(
    seats.length,
    seats.filter(s => s.status === 'occupied').length,
    seats.filter(s => s.status === 'reserved').length
  );

  // Sensor simulation effect
  useEffect(() => {
    if (!isSimulating) return;
    
    const unsubscribe = sensorSimulator.subscribe((readings) => {
      setSeats(prev => prev.map(seat => {
        const reading = readings.find(r => r.seatId === seat.id);
        if (!reading) return seat;
        
        let newStatus: SeatStatus = seat.status;
        if (!reading.isOnline) {
          newStatus = 'offline';
        } else if (reading.value.detected && seat.status !== 'reserved') {
          newStatus = 'occupied';
        } else if (!reading.value.detected && seat.status === 'occupied') {
          newStatus = 'available';
        }
        
        return {
          ...seat,
          status: newStatus,
          sensorData: {
            confidence: reading.confidence,
            batteryLevel: reading.batteryLevel,
            rssi: reading.rssi,
            isOnline: reading.isOnline,
            lastUpdate: reading.timestamp,
          },
        };
      }));
    });

    sensorSimulator.start();
    return () => {
      unsubscribe();
      sensorSimulator.stop();
    };
  }, [isSimulating]);

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  const handleReservation = (duration: number, autoAssign: boolean) => {
    if (autoAssign) {
      const candidates = seats.filter(s => s.status === 'available').map(s => ({
        ...s,
        sensorConfidence: s.sensorData?.confidence || 0.5,
        lastOccupiedAt: null,
        lastVacantAt: new Date(),
      }));
      
      const result = allocateSeat(candidates as any, preferences);
      if (result) {
        setSeats(prev => prev.map(s => 
          s.id === result.seatId ? { ...s, status: 'reserved' as SeatStatus } : s
        ));
        toast.success(`Smart allocation: Seat ${result.seatNumber}`, {
          description: result.reasons.slice(0, 2).join(', '),
        });
      }
    } else if (selectedSeat) {
      setSeats(prev => prev.map(s => 
        s.id === selectedSeat.id ? { ...s, status: 'reserved' as SeatStatus } : s
      ));
      toast.success(`Reserved Seat ${selectedSeat.seatNumber}`, {
        description: `Duration: ${duration} minutes`,
      });
    }
    
    setIsModalOpen(false);
    setSelectedSeat(null);
  };

  const handleScenario = (scenario: 'morning_rush' | 'afternoon_steady' | 'evening_quiet' | 'random') => {
    generateScenario(scenario);
    toast.info(`Scenario: ${scenario.replace('_', ' ')}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-primary mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">Total Seats</span>
          </div>
          <p className="text-2xl font-bold">{seats.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Available</span>
          </div>
          <p className="text-2xl font-bold">{seats.filter(s => s.status === 'available').length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Occupancy</span>
          </div>
          <p className="text-2xl font-bold">{utilization.occupancyRate}%</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <Badge className={
            utilization.utilizationScore === 'Critical' ? 'bg-rose-500' :
            utilization.utilizationScore === 'High' ? 'bg-amber-500' :
            utilization.utilizationScore === 'Moderate' ? 'bg-emerald-500' : 'bg-blue-500'
          }>
            {utilization.utilizationScore}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={showSensorDetails} onCheckedChange={setShowSensorDetails} id="sensor" />
            <Label htmlFor="sensor">Sensor Details</Label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isSimulating ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isSimulating ? 'Stop' : 'Start'} Simulation
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Scenarios:</span>
          <Button size="sm" variant="outline" onClick={() => handleScenario('morning_rush')}>Morning Rush</Button>
          <Button size="sm" variant="outline" onClick={() => handleScenario('evening_quiet')}>Evening Quiet</Button>
          <Button size="sm" variant="outline" onClick={() => setSeats(generateMockSeats())}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium">Your Preferences</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'preferWindow', label: 'Window', icon: Sun },
            { key: 'preferQuiet', label: 'Quiet Zone', icon: Volume2 },
            { key: 'preferPowerOutlet', label: 'Power Outlet', icon: Zap },
            { key: 'preferMonitor', label: 'Monitor', icon: Monitor },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={preferences[key as keyof UserPreferences] ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreferences(p => ({ ...p, [key]: !p[key as keyof UserPreferences] }))}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Seat Map */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Study Room A - Floor 1</h2>
        <SeatMap
          seats={seats}
          onSeatSelect={handleSeatSelect}
          selectedSeatId={selectedSeat?.id}
          showSensorDetails={showSensorDetails}
        />
      </div>

      {/* Heatmap */}
      <div className="glass-card p-6 rounded-xl">
        <OccupancyHeatmap data={generateHeatmapData()} />
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSeat(null); }}
        seat={selectedSeat}
        onConfirm={handleReservation}
      />
    </div>
  );
};

export default StudyRooms;
