// Mock Firebase configuration for SmartRoom Premium
// In production, replace with actual Firebase SDK

export const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "smartroom-premium.firebaseapp.com",
  databaseURL: "https://smartroom-premium.firebaseio.com",
  projectId: "smartroom-premium-iot",
  storageBucket: "smartroom-premium.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Mock data generators
export const generateMockRoomData = () => ({
  temperature: Math.floor(Math.random() * 10) + 18,
  humidity: Math.floor(Math.random() * 30) + 40,
  occupancy: Math.floor(Math.random() * 10),
  lastUpdated: new Date().toISOString()
});

export const generateMockAlerts = () => [
  { id: 1, type: "warning", message: "High temperature detected" },
  { id: 2, type: "info", message: "System update available" },
  { id: 3, type: "danger", message: "Motion detected after hours" }
];

// Mock Firebase class
class MockFirebase {
  private isConnected: boolean = false;

  async connect(): Promise<boolean> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isConnected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async fetchRoomData(roomId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockRoomData();
  }

  async fetchAlerts() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockAlerts();
  }
}

export const firebase = new MockFirebase();
export default firebase;
