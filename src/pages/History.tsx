import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Thermometer,
  Shield,
  Power,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HistoryEvent {
  id: string;
  time: string;
  date: string;
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "danger";
  icon: LucideIcon;
}

const historyEvents: HistoryEvent[] = [
  {
    id: "1",
    time: "10:45 AM",
    date: "Today",
    title: "High Temperature Alert",
    description: "Server Room temperature exceeded 28°C threshold. Cooling system activated automatically.",
    type: "warning",
    icon: Thermometer,
  },
  {
    id: "2",
    time: "09:30 AM",
    date: "Today",
    title: "Occupancy Peak Detected",
    description: "Conference Room A reached maximum capacity (12/12 occupants).",
    type: "info",
    icon: Users,
  },
  {
    id: "3",
    time: "08:15 AM",
    date: "Today",
    title: "System Online",
    description: "All monitoring systems are operational. 24 rooms connected.",
    type: "success",
    icon: Power,
  },
  {
    id: "4",
    time: "11:30 PM",
    date: "Yesterday",
    title: "Security Alert",
    description: "Motion detected in restricted area after hours. Security notified.",
    type: "danger",
    icon: Shield,
  },
  {
    id: "5",
    time: "06:45 PM",
    date: "Yesterday",
    title: "Energy Optimization",
    description: "Automatic power-down initiated for unoccupied rooms. Saved 45kWh.",
    type: "success",
    icon: Activity,
  },
  {
    id: "6",
    time: "02:00 PM",
    date: "Yesterday",
    title: "Maintenance Scheduled",
    description: "HVAC system maintenance scheduled for Server Room tomorrow.",
    type: "info",
    icon: Bell,
  },
  {
    id: "7",
    time: "10:00 AM",
    date: "Dec 3, 2025",
    title: "Humidity Alert",
    description: "Open Space 1 humidity dropped below 40%. Humidifier activated.",
    type: "warning",
    icon: AlertTriangle,
  },
];

const getTypeStyles = (type: HistoryEvent["type"]) => {
  switch (type) {
    case "info":
      return { dot: "bg-primary", bg: "from-primary/20 to-primary/5", border: "border-primary/30" };
    case "warning":
      return { dot: "bg-amber-400", bg: "from-amber-400/20 to-amber-400/5", border: "border-amber-400/30" };
    case "success":
      return { dot: "bg-emerald-400", bg: "from-emerald-400/20 to-emerald-400/5", border: "border-emerald-400/30" };
    case "danger":
      return { dot: "bg-red-400", bg: "from-red-400/20 to-red-400/5", border: "border-red-400/30" };
  }
};

const History = () => {
  let currentDate = "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="opacity-0 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Activity History</h2>
        <p className="text-muted-foreground">Track all system events and alerts</p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent opacity-30" />

        <div className="space-y-6">
          {historyEvents.map((event, index) => {
            const showDate = event.date !== currentDate;
            if (showDate) currentDate = event.date;
            const styles = getTypeStyles(event.type);
            const isLeft = index % 2 === 0;

            return (
              <div key={event.id}>
                {/* Date separator */}
                {showDate && (
                  <div 
                    className="flex items-center justify-center mb-6 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="glass-card px-4 py-2 rounded-full">
                      <span className="text-sm font-medium text-muted-foreground">{event.date}</span>
                    </div>
                  </div>
                )}

                {/* Event card */}
                <div 
                  className={cn(
                    "relative flex items-center gap-4 opacity-0",
                    isLeft ? "md:flex-row animate-slide-in-left" : "md:flex-row-reverse animate-slide-in-right",
                    "flex-row"
                  )}
                  style={{ animationDelay: `${index * 100 + 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-4 md:left-1/2 -translate-x-1/2 z-10",
                    "w-4 h-4 rounded-full timeline-dot",
                    styles.dot
                  )} />

                  {/* Card */}
                  <div className={cn(
                    "ml-10 md:ml-0 md:w-[calc(50%-2rem)]",
                    isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                  )}>
                    <div className={cn(
                      "glass-card-hover p-5 border",
                      styles.border
                    )}>
                      <div className={cn(
                        "absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r",
                        styles.bg
                      )} />
                      
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          `bg-gradient-to-br ${styles.bg}`
                        )}>
                          <event.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{event.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load more */}
      <div className="flex justify-center pt-6">
        <button className="btn-glass text-sm text-muted-foreground hover:text-foreground">
          Load More History
        </button>
      </div>
    </div>
  );
};

export default History;
