import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Database,
  Info,
  ExternalLink,
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

const Toggle = ({ enabled, onToggle }: ToggleProps) => (
  <button
    onClick={onToggle}
    className={cn(
      "relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300",
      enabled 
        ? "bg-gradient-to-r from-primary to-secondary" 
        : "bg-white/10"
    )}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300",
        enabled ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [databaseUrl, setDatabaseUrl] = useState("https://smartroom-db.firebaseio.com");
  const [projectId, setProjectId] = useState("smartroom-premium-iot");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsTestingConnection(false);
    setConnectionStatus("success");
    
    // Reset status after 3 seconds
    setTimeout(() => setConnectionStatus("idle"), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* General Settings */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">General</h3>
            <p className="text-sm text-muted-foreground">Manage app preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme interface</p>
              </div>
            </div>
            <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-sm text-muted-foreground">Receive alert notifications</p>
              </div>
            </div>
            <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
          </div>
        </div>
      </div>

      {/* Firebase Connection */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Firebase Connection</h3>
            <p className="text-sm text-muted-foreground">Configure database settings</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Database URL */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Database URL
            </label>
            <input
              type="text"
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
              className="input-glass"
              placeholder="https://your-project.firebaseio.com"
            />
          </div>

          {/* Project ID */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Project ID
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="input-glass"
              placeholder="your-project-id"
            />
          </div>

          {/* Test Connection Button */}
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className={cn(
              "btn-glow w-full flex items-center justify-center gap-2 text-white",
              isTestingConnection && "opacity-70 cursor-not-allowed"
            )}
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing Connection...
              </>
            ) : connectionStatus === "success" ? (
              <>
                <Check className="w-4 h-4" />
                Connection Successful
              </>
            ) : (
              "Test Connection"
            )}
          </button>
        </div>
      </div>

      {/* About */}
      <div 
        className="glass-card p-6 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground">Application information</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">App Name</span>
            <span className="font-medium gradient-text">SmartRoom Premium</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono text-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">Edition</span>
            <span className="badge-success">Premium Edition</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <span className="text-muted-foreground">Documentation</span>
            <a 
              href="#" 
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              View Docs
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div 
        className="text-center text-sm text-muted-foreground opacity-0 animate-fade-in"
        style={{ animationDelay: "400ms" }}
      >
        <p>Made with ❤️ for IoT enthusiasts</p>
        <p className="mt-1">© 2025 SmartRoom Premium. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Settings;
