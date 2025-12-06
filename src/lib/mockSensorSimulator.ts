// Mock IoT Sensor Simulator
// Simulates ESP32 + PIR + Ultrasonic sensors for development

export interface SensorReading {
  seatId: string;
  sensorType: 'pir' | 'ultrasonic' | 'rfid' | 'combined';
  value: {
    detected: boolean;
    distance?: number;
    motion?: boolean;
    rfidTag?: string;
  };
  confidence: number;
  batteryLevel: number;
  rssi: number;
  isOnline: boolean;
  timestamp: Date;
}

export interface MQTTPayload {
  topic: string;
  payload: SensorReading;
}

// MQTT Topic Tree Structure
export const MQTT_TOPICS = {
  OCCUPANCY: (roomId: string, seatId: string) => 
    `smartroom/${roomId}/seat/${seatId}/occupancy`,
  RSSI: (roomId: string, seatId: string) => 
    `smartroom/${roomId}/seat/${seatId}/rssi`,
  BADGE: (roomId: string, userId: string) => 
    `smartroom/${roomId}/user/${userId}/badge`,
  SENSOR_STATUS: (roomId: string, seatId: string) => 
    `smartroom/${roomId}/seat/${seatId}/status`,
  ADMIN_OVERRIDE: (roomId: string) => 
    `smartroom/${roomId}/admin/override`,
};

// Sensor states for simulation
type SensorState = 'occupied' | 'vacant' | 'transitioning' | 'offline';

interface SimulatedSeat {
  id: string;
  seatNumber: string;
  state: SensorState;
  lastStateChange: Date;
  occupancyProbability: number;
}

// Simulation configuration
const SIMULATION_CONFIG = {
  UPDATE_INTERVAL_MS: 3000,
  OCCUPANCY_CHANGE_PROBABILITY: 0.15,
  OFFLINE_PROBABILITY: 0.02,
  BATTERY_DRAIN_RATE: 0.001,
  MIN_BATTERY_LEVEL: 10,
  RSSI_FLUCTUATION: 10,
};

class MockSensorSimulator {
  private seats: Map<string, SimulatedSeat> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: ((readings: SensorReading[]) => void)[] = [];
  private isRunning = false;

  constructor() {
    this.initializeSeats();
  }

  private initializeSeats() {
    // Create mock seats for a study room (5 rows x 6 columns = 30 seats)
    const rows = 5;
    const cols = 6;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
        const id = `seat-${row}-${col}`;
        
        this.seats.set(id, {
          id,
          seatNumber,
          state: Math.random() > 0.7 ? 'occupied' : 'vacant',
          lastStateChange: new Date(Date.now() - Math.random() * 3600000),
          occupancyProbability: 0.3 + Math.random() * 0.4,
        });
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      const readings = this.generateReadings();
      this.notifyListeners(readings);
    }, SIMULATION_CONFIG.UPDATE_INTERVAL_MS);

    // Generate initial readings
    const initialReadings = this.generateReadings();
    this.notifyListeners(initialReadings);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  subscribe(listener: (readings: SensorReading[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(readings: SensorReading[]) {
    this.listeners.forEach(listener => listener(readings));
  }

  private generateReadings(): SensorReading[] {
    const readings: SensorReading[] = [];

    this.seats.forEach((seat, id) => {
      // Simulate state transitions
      this.updateSeatState(seat);

      // Generate sensor reading
      const reading = this.createReading(seat);
      readings.push(reading);
    });

    return readings;
  }

  private updateSeatState(seat: SimulatedSeat) {
    const random = Math.random();

    // Check for offline
    if (random < SIMULATION_CONFIG.OFFLINE_PROBABILITY) {
      seat.state = 'offline';
      return;
    }

    // Restore from offline
    if (seat.state === 'offline' && random > 0.5) {
      seat.state = 'vacant';
      seat.lastStateChange = new Date();
      return;
    }

    // State transitions
    if (random < SIMULATION_CONFIG.OCCUPANCY_CHANGE_PROBABILITY) {
      if (seat.state === 'vacant' && random < seat.occupancyProbability * 0.3) {
        seat.state = 'transitioning';
        setTimeout(() => {
          seat.state = 'occupied';
          seat.lastStateChange = new Date();
        }, 2000);
      } else if (seat.state === 'occupied' && random < 0.1) {
        seat.state = 'transitioning';
        setTimeout(() => {
          seat.state = 'vacant';
          seat.lastStateChange = new Date();
        }, 1500);
      }
    }
  }

  private createReading(seat: SimulatedSeat): SensorReading {
    const isOnline = seat.state !== 'offline';
    const isOccupied = seat.state === 'occupied' || seat.state === 'transitioning';

    // Sensor fusion: combine PIR and Ultrasonic for confidence
    const pirDetected = isOccupied && Math.random() > 0.1;
    const ultrasonicDistance = isOccupied 
      ? 30 + Math.random() * 50 // 30-80cm when occupied
      : 150 + Math.random() * 100; // 150-250cm when vacant

    // Calculate confidence based on sensor agreement
    let confidence = 0.5;
    if (pirDetected && ultrasonicDistance < 100) {
      confidence = 0.95 + Math.random() * 0.05;
    } else if (pirDetected || ultrasonicDistance < 100) {
      confidence = 0.7 + Math.random() * 0.15;
    } else {
      confidence = 0.85 + Math.random() * 0.1;
    }

    return {
      seatId: seat.id,
      sensorType: 'combined',
      value: {
        detected: isOccupied,
        distance: Math.round(ultrasonicDistance),
        motion: pirDetected,
      },
      confidence: Math.round(confidence * 100) / 100,
      batteryLevel: Math.max(
        SIMULATION_CONFIG.MIN_BATTERY_LEVEL,
        Math.round(100 - Math.random() * 30)
      ),
      rssi: Math.round(-50 - Math.random() * SIMULATION_CONFIG.RSSI_FLUCTUATION),
      isOnline,
      timestamp: new Date(),
    };
  }

  // Manual control methods for testing
  setSeatState(seatId: string, state: SensorState) {
    const seat = this.seats.get(seatId);
    if (seat) {
      seat.state = state;
      seat.lastStateChange = new Date();
    }
  }

  getSeatStates(): Map<string, SimulatedSeat> {
    return new Map(this.seats);
  }

  getAllSeats(): SimulatedSeat[] {
    return Array.from(this.seats.values());
  }
}

// Singleton instance
export const sensorSimulator = new MockSensorSimulator();

// Generate deterministic simulation scenarios
export function generateScenario(
  scenario: 'morning_rush' | 'afternoon_steady' | 'evening_quiet' | 'random'
): void {
  const seats = sensorSimulator.getAllSeats();
  
  switch (scenario) {
    case 'morning_rush':
      // 70% occupancy, rapid changes
      seats.forEach((seat, i) => {
        sensorSimulator.setSeatState(
          seat.id,
          i % 10 < 7 ? 'occupied' : 'vacant'
        );
      });
      break;
      
    case 'afternoon_steady':
      // 50% occupancy, stable
      seats.forEach((seat, i) => {
        sensorSimulator.setSeatState(
          seat.id,
          i % 2 === 0 ? 'occupied' : 'vacant'
        );
      });
      break;
      
    case 'evening_quiet':
      // 20% occupancy
      seats.forEach((seat, i) => {
        sensorSimulator.setSeatState(
          seat.id,
          i % 5 === 0 ? 'occupied' : 'vacant'
        );
      });
      break;
      
    case 'random':
    default:
      seats.forEach((seat) => {
        sensorSimulator.setSeatState(
          seat.id,
          Math.random() > 0.6 ? 'occupied' : 'vacant'
        );
      });
      break;
  }
}

// Export mock MQTT message examples
export const MOCK_MQTT_EXAMPLES = {
  occupied: {
    topic: 'smartroom/room-001/seat/A1/occupancy',
    payload: {
      seatId: 'seat-0-0',
      sensorType: 'combined',
      value: { detected: true, distance: 45, motion: true },
      confidence: 0.95,
      batteryLevel: 87,
      rssi: -55,
      isOnline: true,
      timestamp: new Date().toISOString(),
    },
  },
  vacant: {
    topic: 'smartroom/room-001/seat/A1/occupancy',
    payload: {
      seatId: 'seat-0-0',
      sensorType: 'combined',
      value: { detected: false, distance: 180, motion: false },
      confidence: 0.92,
      batteryLevel: 85,
      rssi: -52,
      isOnline: true,
      timestamp: new Date().toISOString(),
    },
  },
  offline: {
    topic: 'smartroom/room-001/seat/A1/status',
    payload: {
      seatId: 'seat-0-0',
      sensorType: 'combined',
      value: { detected: false },
      confidence: 0,
      batteryLevel: 0,
      rssi: -100,
      isOnline: false,
      timestamp: new Date().toISOString(),
    },
  },
  rfidCheckIn: {
    topic: 'smartroom/room-001/user/user-123/badge',
    payload: {
      seatId: 'seat-0-0',
      sensorType: 'rfid',
      value: { detected: true, rfidTag: 'RFID-2024-001' },
      confidence: 1.0,
      batteryLevel: 100,
      rssi: -45,
      isOnline: true,
      timestamp: new Date().toISOString(),
    },
  },
  adminOverride: {
    topic: 'smartroom/room-001/admin/override',
    payload: {
      seatId: 'seat-0-0',
      sensorType: 'combined',
      value: { detected: false },
      confidence: 1.0,
      batteryLevel: 100,
      rssi: -40,
      isOnline: true,
      timestamp: new Date().toISOString(),
    },
  },
};
