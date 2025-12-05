import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  Bar,
  BarChart,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data
const weeklyOccupancy = [
  { day: "Mon", occupancy: 72, energy: 145 },
  { day: "Tue", occupancy: 85, energy: 168 },
  { day: "Wed", occupancy: 78, energy: 152 },
  { day: "Thu", occupancy: 92, energy: 178 },
  { day: "Fri", occupancy: 88, energy: 172 },
  { day: "Sat", occupancy: 45, energy: 98 },
  { day: "Sun", occupancy: 32, energy: 78 },
];

const hourlyData = [
  { hour: "00", value: 12 },
  { hour: "04", value: 8 },
  { hour: "08", value: 45 },
  { hour: "12", value: 78 },
  { hour: "16", value: 65 },
  { hour: "20", value: 42 },
];

const roomDistribution = [
  { name: "Occupied", value: 18, color: "#3B82F6" },
  { name: "Available", value: 4, color: "#10B981" },
  { name: "Maintenance", value: 2, color: "#EF4444" },
];

const deviceStatus = [
  { name: "Online", value: 42, color: "#10B981" },
  { name: "Offline", value: 8, color: "#6B7280" },
  { name: "Warning", value: 3, color: "#F59E0B" },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-1 p-1 rounded-xl glass-card">
          {(["day", "week", "month"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize",
                timeRange === range 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>

        <button className="btn-glass flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Avg Occupancy</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">74%</p>
          <p className="text-xs text-emerald-400 mt-1">+8% vs last week</p>
        </div>
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Energy Usage</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">991 kWh</p>
          <p className="text-xs text-red-400 mt-1">-3% vs last week</p>
        </div>
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Peak Hours</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">12-2 PM</p>
          <p className="text-xs text-muted-foreground mt-1">Highest activity</p>
        </div>
        <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground text-sm">Total Alerts</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-foreground">23</p>
          <p className="text-xs text-muted-foreground mt-1">This week</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Occupancy & Energy */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Weekly Overview</h3>
          <p className="text-sm text-muted-foreground mb-6">Occupancy vs Energy consumption</p>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOccupancy} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="occupancy" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Occupancy %" />
                <Bar dataKey="energy" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Energy kWh" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Activity */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Hourly Activity</h3>
          <p className="text-sm text-muted-foreground mb-6">Average occupancy by hour</p>
          
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(value) => `${value}:00`}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  fill="url(#hourlyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 - Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Distribution */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Room Status</h3>
          <p className="text-sm text-muted-foreground mb-6">Current room distribution</p>
          
          <div className="h-[280px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roomDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Status */}
        <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
          <h3 className="text-lg font-semibold text-foreground mb-1">Device Health</h3>
          <p className="text-sm text-muted-foreground mb-6">Connected devices status</p>
          
          <div className="h-[280px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(20, 25, 45, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
