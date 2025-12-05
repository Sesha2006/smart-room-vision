import { 
  Building2, 
  Users, 
  AlertTriangle, 
  Droplets,
  Thermometer,
  Zap,
  UserCheck
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from "recharts";
import StatCard from "@/components/StatCard";
import MiniStatCard from "@/components/MiniStatCard";

// Mock data
const occupancyTrendData = [
  { time: "00:00", value: 12 },
  { time: "04:00", value: 8 },
  { time: "08:00", value: 45 },
  { time: "12:00", value: 78 },
  { time: "16:00", value: 65 },
  { time: "20:00", value: 42 },
  { time: "23:59", value: 18 },
];

const humidityData = [45, 48, 52, 49, 55, 53, 50];
const temperatureData = [22, 23, 24, 23, 22, 21, 22];
const powerData = [120, 145, 160, 155, 170, 165, 158];
const visitorsData = [25, 32, 45, 38, 52, 48, 55];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Total Rooms"
          value={24}
          subtitle="6 floors • Building A"
          icon={Building2}
          delay={0}
        />
        <StatCard
          title="Active Occupancy"
          value="18/24"
          subtitle="75% capacity"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          delay={100}
        />
        <StatCard
          title="Active Alerts"
          value={3}
          subtitle="2 critical • 1 warning"
          icon={AlertTriangle}
          delay={200}
        />
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MiniStatCard
          title="Humidity"
          value={52}
          unit="%"
          icon={Droplets}
          sparklineData={humidityData}
          color="#06B6D4"
          delay={300}
        />
        <MiniStatCard
          title="Temperature"
          value={23}
          unit="°C"
          icon={Thermometer}
          sparklineData={temperatureData}
          color="#F59E0B"
          delay={400}
        />
        <MiniStatCard
          title="Power Usage"
          value={158}
          unit="kWh"
          icon={Zap}
          sparklineData={powerData}
          color="#8B5CF6"
          delay={500}
        />
        <MiniStatCard
          title="Today's Visitors"
          value={55}
          icon={UserCheck}
          sparklineData={visitorsData}
          color="#10B981"
          delay={600}
        />
      </div>

      {/* Occupancy Trend Chart */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "700ms" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Occupancy Trend</h3>
            <p className="text-sm text-muted-foreground">Last 24 hours activity</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"></span>
            <span className="text-sm text-muted-foreground">Occupancy</span>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={occupancyTrendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.05)" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
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
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="url(#strokeGradient)"
                strokeWidth={3}
                fill="url(#occupancyGradient)"
              />
              <defs>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "800ms" }}
      >
        {["View All Rooms", "Export Report", "Add Device", "Settings"].map((action, index) => (
          <button
            key={action}
            className="btn-glass text-sm text-muted-foreground hover:text-foreground"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
