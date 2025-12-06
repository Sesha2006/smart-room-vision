// Smart Seat Allocation Engine
// Intelligent algorithm that considers multiple factors for optimal seat assignment

export interface SeatFeatures {
  hasWindow: boolean;
  hasPowerOutlet: boolean;
  isQuietZone: boolean;
  hasMonitor: boolean;
  isAccessible: boolean;
}

export interface UserPreferences {
  preferWindow?: boolean;
  preferQuiet?: boolean;
  preferPowerOutlet?: boolean;
  preferMonitor?: boolean;
  needsAccessible?: boolean;
}

export interface SeatCandidate {
  id: string;
  seatNumber: string;
  status: 'available' | 'reserved' | 'occupied' | 'offline' | 'maintenance';
  features: SeatFeatures;
  sensorConfidence: number;
  lastOccupiedAt: Date | null;
  lastVacantAt: Date | null;
  rowPosition: number;
  colPosition: number;
}

export interface AllocationResult {
  seatId: string;
  seatNumber: string;
  score: number;
  reasons: string[];
}

// Configuration for scoring weights
const SCORING_WEIGHTS = {
  FEATURE_MATCH: 20,
  SENSOR_CONFIDENCE: 15,
  VACANCY_RECENCY: 10,
  POSITION_PREFERENCE: 5,
  COOLDOWN_PENALTY: -30,
};

// Minimum cooldown time after a seat becomes vacant (in minutes)
const VACANCY_COOLDOWN_MINUTES = 5;

/**
 * Smart Seat Allocation Algorithm
 * 
 * Considers:
 * 1. Seat features vs user preferences
 * 2. Live occupancy sensor state
 * 3. Confidence score from sensors
 * 4. Avoiding recently occupied seats (cooldown period)
 * 5. Position preferences
 * 6. Auto-release after inactivity
 */
export function allocateSeat(
  availableSeats: SeatCandidate[],
  userPreferences: UserPreferences
): AllocationResult | null {
  if (availableSeats.length === 0) {
    return null;
  }

  const scoredSeats = availableSeats
    .filter(seat => seat.status === 'available')
    .map(seat => scoreSeat(seat, userPreferences))
    .sort((a, b) => b.score - a.score);

  if (scoredSeats.length === 0) {
    return null;
  }

  return scoredSeats[0];
}

function scoreSeat(
  seat: SeatCandidate,
  preferences: UserPreferences
): AllocationResult {
  let score = 50; // Base score
  const reasons: string[] = [];

  // 1. Feature matching
  const features = seat.features;
  
  if (preferences.preferWindow && features.hasWindow) {
    score += SCORING_WEIGHTS.FEATURE_MATCH;
    reasons.push('Window seat preference matched');
  }
  
  if (preferences.preferQuiet && features.isQuietZone) {
    score += SCORING_WEIGHTS.FEATURE_MATCH;
    reasons.push('Quiet zone preference matched');
  }
  
  if (preferences.preferPowerOutlet && features.hasPowerOutlet) {
    score += SCORING_WEIGHTS.FEATURE_MATCH;
    reasons.push('Power outlet available');
  }
  
  if (preferences.preferMonitor && features.hasMonitor) {
    score += SCORING_WEIGHTS.FEATURE_MATCH;
    reasons.push('Monitor available');
  }
  
  if (preferences.needsAccessible && features.isAccessible) {
    score += SCORING_WEIGHTS.FEATURE_MATCH * 2; // Higher weight for accessibility
    reasons.push('Accessible seat');
  } else if (preferences.needsAccessible && !features.isAccessible) {
    score -= 100; // Heavy penalty if accessibility needed but not available
    reasons.push('Not accessible - lower priority');
  }

  // 2. Sensor confidence score
  if (seat.sensorConfidence >= 0.9) {
    score += SCORING_WEIGHTS.SENSOR_CONFIDENCE;
    reasons.push('High sensor confidence');
  } else if (seat.sensorConfidence >= 0.7) {
    score += SCORING_WEIGHTS.SENSOR_CONFIDENCE * 0.5;
    reasons.push('Medium sensor confidence');
  } else {
    score -= SCORING_WEIGHTS.SENSOR_CONFIDENCE;
    reasons.push('Low sensor confidence');
  }

  // 3. Vacancy cooldown - avoid recently vacated seats
  if (seat.lastOccupiedAt) {
    const minutesSinceOccupied = (Date.now() - seat.lastOccupiedAt.getTime()) / (1000 * 60);
    if (minutesSinceOccupied < VACANCY_COOLDOWN_MINUTES) {
      score += SCORING_WEIGHTS.COOLDOWN_PENALTY;
      reasons.push(`Recently vacated (${Math.round(minutesSinceOccupied)}min ago)`);
    }
  }

  // 4. Vacancy duration bonus - prefer seats vacant for longer
  if (seat.lastVacantAt) {
    const minutesVacant = (Date.now() - seat.lastVacantAt.getTime()) / (1000 * 60);
    if (minutesVacant > 30) {
      score += SCORING_WEIGHTS.VACANCY_RECENCY;
      reasons.push('Long vacancy period - well rested');
    }
  }

  // 5. Position scoring (prefer middle rows for general use)
  const rowScore = Math.max(0, 5 - Math.abs(seat.rowPosition - 2)) * 2;
  score += rowScore;
  if (rowScore > 5) {
    reasons.push('Optimal row position');
  }

  return {
    seatId: seat.id,
    seatNumber: seat.seatNumber,
    score: Math.max(0, score),
    reasons,
  };
}

/**
 * Check if a seat should be auto-released due to inactivity
 */
export function shouldAutoRelease(
  lastActivityAt: Date,
  inactivityThresholdMinutes: number = 30
): boolean {
  const minutesSinceActivity = (Date.now() - lastActivityAt.getTime()) / (1000 * 60);
  return minutesSinceActivity > inactivityThresholdMinutes;
}

/**
 * Calculate room utilization metrics
 */
export function calculateUtilization(
  totalSeats: number,
  occupiedSeats: number,
  reservedSeats: number
): {
  occupancyRate: number;
  reservationRate: number;
  availabilityRate: number;
  utilizationScore: string;
} {
  const occupancyRate = (occupiedSeats / totalSeats) * 100;
  const reservationRate = (reservedSeats / totalSeats) * 100;
  const availabilityRate = ((totalSeats - occupiedSeats - reservedSeats) / totalSeats) * 100;

  let utilizationScore: string;
  const totalUtilization = occupancyRate + reservationRate;

  if (totalUtilization >= 90) {
    utilizationScore = 'Critical';
  } else if (totalUtilization >= 70) {
    utilizationScore = 'High';
  } else if (totalUtilization >= 40) {
    utilizationScore = 'Moderate';
  } else {
    utilizationScore = 'Low';
  }

  return {
    occupancyRate: Math.round(occupancyRate * 10) / 10,
    reservationRate: Math.round(reservationRate * 10) / 10,
    availabilityRate: Math.round(availabilityRate * 10) / 10,
    utilizationScore,
  };
}

/**
 * Generate optimal seat recommendations based on current state
 */
export function getRecommendations(
  seats: SeatCandidate[],
  preferences: UserPreferences,
  count: number = 3
): AllocationResult[] {
  const availableSeats = seats.filter(s => s.status === 'available');
  
  return availableSeats
    .map(seat => scoreSeat(seat, preferences))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
