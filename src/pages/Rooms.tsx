import { useState } from "react";
import { 
  Home, 
  Users, 
  Thermometer, 
  Droplets,
  ToggleLeft,
  ToggleRight,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  name: string;
  floor: number;
  occupancy: number;
  maxOccupancy: number;
  temperature: number;
  humidity: number;
  status: "occupied" | "free" | "maintenance";
  isActive: boolean;
}

const mockRooms: Room[] = [
  { id: "1", name: "Conference Room A", floor: 1, occupancy: 8, maxOccupancy: 12, temperature: 22, humidity: 45, status: "occupied", isActive: true },
  { id: "2", name: "Executive Suite", floor: 3, occupancy: 0, maxOccupancy: 6, temperature: 21, humidity: 48, status: "free", isActive: true },
  { id: "3", name: "Open Space 1", floor: 1, occupancy: 24, maxOccupancy: 30, temperature: 23, humidity: 52, status: "occupied", isActive: true },
  { id: "4", name: "Meeting Room B", floor: 2, occupancy: 4, maxOccupancy: 8, temperature: 22, humidity: 50, status: "occupied", isActive: true },
  { id: "5", name: "Server Room", floor: 0, occupancy: 0, maxOccupancy: 4, temperature: 18, humidity: 40, status: "maintenance", isActive: false },
  { id: "6", name: "Cafeteria", floor: 1, occupancy: 15, maxOccupancy: 50, temperature: 24, humidity: 55, status: "occupied", isActive: true },
  { id: "7", name: "Lobby", floor: 0, occupancy: 3, maxOccupancy: 20, temperature: 22, humidity: 48, status: "occupied", isActive: true },
  { id: "8", name: "Training Room", floor: 2, occupancy: 0, maxOccupancy: 20, temperature: 21, humidity: 47, status: "free", isActive: true },
];

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "occupied" | "free">("all");

  const toggleRoom = (id: string) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, isActive: !room.isActive } : room
    ));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || 
      (filter === "occupied" && room.status === "occupied") ||
      (filter === "free" && room.status === "free");
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Room["status"]) => {
    switch (status) {
      case "occupied":
        return <span className="badge-warning">Occupied</span>;
      case "free":
        return <span className="badge-success">Available</span>;
      case "maintenance":
        return <span className="badge-danger">Maintenance</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-xl glass-card">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search rooms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-full sm:w-40"
            />
          </div>
          
          {/* Filter buttons */}
          <div className="flex gap-1 p-1 rounded-xl glass-card">
            {(["all", "occupied", "free"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 capitalize",
                  filter === f 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredRooms.map((room, index) => (
          <div
            key={room.id}
            className="glass-card-hover p-5 opacity-0 animate-fade-in-up group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  room.isActive ? "bg-primary/20" : "bg-muted"
                )}>
                  <Home className={cn(
                    "w-5 h-5",
                    room.isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{room.name}</h3>
                  <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
                </div>
              </div>
              {getStatusBadge(room.status)}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className="text-sm font-semibold">{room.occupancy}/{room.maxOccupancy}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <Thermometer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Temp</p>
                <p className="text-sm font-semibold">{room.temperature}°C</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-sm font-semibold">{room.humidity}%</p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-sm text-muted-foreground">
                {room.isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={() => toggleRoom(room.id)}
                className="transition-all duration-300 hover:scale-110"
                disabled={room.status === "maintenance"}
              >
                {room.isActive ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredRooms.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No rooms found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
};

export default Rooms;
