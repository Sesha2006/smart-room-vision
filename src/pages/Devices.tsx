import { useState, useEffect } from "react";
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Plus, 
  Trash2, 
  RefreshCw,
  Router,
  Thermometer,
  Camera,
  Lightbulb,
  Lock,
  Search,
  MoreVertical,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Device {
  id: string;
  name: string;
  type: string;
  room_id: string | null;
  status: string;
  ip_address: string | null;
  mac_address: string | null;
  firmware_version: string | null;
  is_online: boolean;
  last_seen: string | null;
}

const deviceIcons: Record<string, any> = {
  sensor: Thermometer,
  camera: Camera,
  light: Lightbulb,
  router: Router,
  lock: Lock,
  default: Cpu,
};

const getSignalIcon = (strength: number) => {
  if (strength > 75) return SignalHigh;
  if (strength > 50) return SignalMedium;
  if (strength > 25) return SignalLow;
  return Signal;
};

const Devices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: "", type: "sensor", ip_address: "" });

  useEffect(() => {
    if (user) {
      fetchDevices();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('devices-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'devices',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchDevices();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchDevices = async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Failed to load devices");
    } else {
      setDevices(data || []);
    }
    setLoading(false);
  };

  const addDevice = async () => {
    if (!newDevice.name.trim()) {
      toast.error("Please enter a device name");
      return;
    }

    const { error } = await supabase.from('devices').insert({
      name: newDevice.name,
      type: newDevice.type,
      ip_address: newDevice.ip_address || null,
      user_id: user?.id,
      status: 'offline',
      is_online: false,
    });

    if (error) {
      toast.error("Failed to add device");
    } else {
      toast.success("Device added successfully");
      setShowAddModal(false);
      setNewDevice({ name: "", type: "sensor", ip_address: "" });
      fetchDevices();
    }
  };

  const deleteDevice = async (id: string) => {
    const { error } = await supabase.from('devices').delete().eq('id', id);
    
    if (error) {
      toast.error("Failed to delete device");
    } else {
      toast.success("Device removed");
      fetchDevices();
    }
  };

  const simulateConnection = async (id: string) => {
    const device = devices.find(d => d.id === id);
    const newStatus = device?.is_online ? false : true;
    
    const { error } = await supabase
      .from('devices')
      .update({ 
        is_online: newStatus, 
        status: newStatus ? 'online' : 'offline',
        last_seen: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      toast.error("Connection failed");
    } else {
      toast.success(newStatus ? "Device connected" : "Device disconnected");
      fetchDevices();
    }
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineCount = devices.filter(d => d.is_online).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Devices</p>
              <p className="text-2xl font-bold">{devices.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Online</p>
              <p className="text-2xl font-bold text-emerald-400">{onlineCount}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offline</p>
              <p className="text-2xl font-bold text-red-400">{devices.length - onlineCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl glass-card">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search devices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full sm:w-40"
            />
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-glow flex items-center gap-2 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Devices Grid */}
      {loading ? (
        <div className="glass-card p-12 text-center">
          <RefreshCw className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground mt-4">Loading devices...</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No devices found</h3>
          <p className="text-muted-foreground mb-4">Add your first IoT device to get started</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-glass text-sm"
          >
            Add Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredDevices.map((device, index) => {
            const Icon = deviceIcons[device.type] || deviceIcons.default;
            const SignalIcon = getSignalIcon(device.is_online ? 85 : 0);
            
            return (
              <div
                key={device.id}
                className="glass-card-hover p-5 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      device.is_online ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        device.is_online ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{device.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{device.type}</p>
                    </div>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                    device.is_online 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-400"
                  )}>
                    {device.is_online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {device.is_online ? "Online" : "Offline"}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {device.ip_address && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono text-foreground">{device.ip_address}</span>
                    </div>
                  )}
                  {device.mac_address && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">MAC</span>
                      <span className="font-mono text-foreground text-xs">{device.mac_address}</span>
                    </div>
                  )}
                  {device.last_seen && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Seen</span>
                      <span className="text-foreground">
                        {new Date(device.last_seen).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Signal</span>
                    <SignalIcon className={cn(
                      "w-4 h-4",
                      device.is_online ? "text-emerald-400" : "text-muted-foreground"
                    )} />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button 
                    onClick={() => simulateConnection(device.id)}
                    className={cn(
                      "flex-1 btn-glass text-xs py-2",
                      device.is_online ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {device.is_online ? "Disconnect" : "Connect"}
                  </button>
                  <button 
                    onClick={() => deleteDevice(device.id)}
                    className="btn-glass text-xs py-2 px-3 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="glass-card p-6 w-full max-w-md animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New Device</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="input-glass"
                  placeholder="Living Room Sensor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Device Type
                </label>
                <select
                  value={newDevice.type}
                  onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                  className="input-glass"
                >
                  <option value="sensor">Temperature Sensor</option>
                  <option value="camera">Camera</option>
                  <option value="light">Smart Light</option>
                  <option value="router">Router/Gateway</option>
                  <option value="lock">Smart Lock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  IP Address (optional)
                </label>
                <input
                  type="text"
                  value={newDevice.ip_address}
                  onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                  className="input-glass"
                  placeholder="192.168.1.100"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-glass"
              >
                Cancel
              </button>
              <button 
                onClick={addDevice}
                className="flex-1 btn-glow text-white"
              >
                Add Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;
