import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Home, 
  History, 
  Settings, 
  ChevronLeft,
  Cpu,
  Bell,
  BarChart3,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Home, label: "Rooms", path: "/rooms" },
  { icon: Cpu, label: "Devices", path: "/devices" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-[260px]"
        )}
      >
        <div className="h-full glass-card rounded-none lg:rounded-r-3xl flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-blue">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">SmartRoom</h1>
                <p className="text-xs text-muted-foreground">Premium Edition</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-white/5",
                  isActive && "sidebar-item-active text-primary"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => window.innerWidth < 1024 && onToggle()}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-white/10">
            {user && (
              <div className="glass-card p-3 rounded-xl mb-3">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                v1.0 • <span className="text-primary">connected</span>
              </p>
            </div>
          </div>

          {/* Toggle button - Desktop only */}
          <button
            onClick={onToggle}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 items-center justify-center rounded-full glass-card hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
